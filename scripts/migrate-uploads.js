const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function saveBase64ToFile(dataUrl, fallbackName = 'migrated_file') {
  try {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) return null;

    const mime = match[1] || 'application/octet-stream';
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) return null;

    let ext = MIME_EXT[mime.toLowerCase()];
    if (!ext) {
      const nameExt = path.extname(fallbackName).toLowerCase();
      ext = nameExt && nameExt.length > 1 ? nameExt : '.bin';
    }

    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}_${hash}${ext}`;
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[saveBase64ToFile] Error extracting file:', err);
    return null;
  }
}

async function main() {
  console.log('=== TSPL Forms: Starting CDN Storage & Uploads Migration ===');
  ensureUploadsDir();

  let migratedSubmissions = 0;
  let migratedFilesCount = 0;
  let totalBytesSaved = 0;

  // 1. Process FormSubmissions
  const submissions = await prisma.formSubmissions.findMany({
    where: {
      content: {
        contains: 'data:',
      },
    },
    select: {
      id: true,
      content: true,
    },
  });

  console.log(`Found ${submissions.length} submissions containing base64 data.`);

  for (const sub of submissions) {
    try {
      let contentObj;
      try {
        contentObj = JSON.parse(sub.content);
      } catch {
        continue;
      }

      if (!contentObj || typeof contentObj !== 'object') continue;

      let changed = false;

      for (const [key, value] of Object.entries(contentObj)) {
        if (typeof value === 'string') {
          if (value.includes('dataUrl') && value.startsWith('{')) {
            try {
              const filePayload = JSON.parse(value);
              if (filePayload.dataUrl && filePayload.dataUrl.startsWith('data:')) {
                const initialLen = filePayload.dataUrl.length;
                const cdnUrl = saveBase64ToFile(filePayload.dataUrl, filePayload.name || key);
                if (cdnUrl) {
                  filePayload.dataUrl = cdnUrl;
                  filePayload.url = cdnUrl;
                  contentObj[key] = JSON.stringify(filePayload);
                  changed = true;
                  migratedFilesCount++;
                  totalBytesSaved += initialLen - cdnUrl.length;
                }
              }
            } catch {}
          } else if (value.startsWith('data:')) {
            const initialLen = value.length;
            const cdnUrl = saveBase64ToFile(value, key);
            if (cdnUrl) {
              contentObj[key] = cdnUrl;
              changed = true;
              migratedFilesCount++;
              totalBytesSaved += initialLen - cdnUrl.length;
            }
          }
        }
      }

      if (changed) {
        await prisma.formSubmissions.update({
          where: { id: sub.id },
          data: { content: JSON.stringify(contentObj) },
        });
        migratedSubmissions++;
      }
    } catch (subErr) {
      console.error(`Error migrating submission #${sub.id}:`, subErr);
    }
  }

  // 2. Process Forms (form templates, banners, etc.)
  let migratedForms = 0;
  const forms = await prisma.form.findMany({
    where: {
      content: {
        contains: 'data:image/',
      },
    },
    select: {
      id: true,
      content: true,
    },
  });

  console.log(`Found ${forms.length} forms containing base64 images in content.`);

  for (const form of forms) {
    try {
      let formContent;
      try {
        formContent = JSON.parse(form.content);
      } catch {
        continue;
      }

      if (!Array.isArray(formContent)) continue;

      let changed = false;

      for (const element of formContent) {
        if (element.extraAttributes) {
          for (const [attrKey, attrVal] of Object.entries(element.extraAttributes)) {
            if (typeof attrVal === 'string' && attrVal.startsWith('data:image/')) {
              const cdnUrl = saveBase64ToFile(attrVal, `${element.id}_${attrKey}`);
              if (cdnUrl) {
                element.extraAttributes[attrKey] = cdnUrl;
                changed = true;
                migratedFilesCount++;
              }
            }
          }
        }
      }

      if (changed) {
        await prisma.form.update({
          where: { id: form.id },
          data: { content: JSON.stringify(formContent) },
        });
        migratedForms++;
      }
    } catch (formErr) {
      console.error(`Error migrating form #${form.id}:`, formErr);
    }
  }

  console.log('=== Migration Complete ===', {
    migratedSubmissions,
    migratedForms,
    migratedFilesCount,
    totalBytesSavedMB: (totalBytesSaved / (1024 * 1024)).toFixed(2),
  });

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
