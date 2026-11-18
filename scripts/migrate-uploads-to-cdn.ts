import { migrateAllUploadsToCDN } from '../lib/migrate-uploads';

async function main() {
  console.log('=== TSPL Forms: Starting CDN Storage & Uploads Migration ===');
  const res = await migrateAllUploadsToCDN();
  console.log('=== Migration Result ===', res);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
