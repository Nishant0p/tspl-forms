import QRCode from 'qrcode';

export type QRCodeOptions = {
  width?: number;
  margin?: number;
  logoSrc?: string;
};

/**
 * Generates a QR Code data URL with the TSPL logo embedded cleanly in the center.
 * Uses Error Correction Level 'H' (High - 30% recovery) to ensure 100% scannability.
 */
export async function generateBrandedQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const size = options.width || 320;
  const margin = options.margin ?? 2;
  const logoSrc = options.logoSrc || '/tspl-icon-mark.png';

  // Generate base QR code with High error correction level ('H')
  const qrDataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  // If server-side, return base QR
  if (typeof window === 'undefined') {
    return qrDataUrl;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return resolve(qrDataUrl);
    }

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';

    qrImg.onload = () => {
      // 1. Draw base QR code onto canvas
      ctx.drawImage(qrImg, 0, 0, size, size);

      // 2. Load TSPL logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      logoImg.onload = () => {
        // Calculate center badge dimensions (approx 24% of total size)
        const logoSize = Math.floor(size * 0.24);
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        const padding = Math.max(4, Math.floor(logoSize * 0.12));
        const badgeSize = logoSize + padding * 2;
        const badgeX = (size - badgeSize) / 2;
        const badgeY = (size - badgeSize) / 2;
        const radius = Math.floor(badgeSize * 0.22);

        // 3. Draw rounded white background badge
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
        } else {
          ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
        }
        ctx.fill();

        // 4. Draw subtle border around badge
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = Math.max(1, Math.floor(size / 160));
        ctx.stroke();

        // 5. Draw TSPL Logo centered inside badge
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        resolve(canvas.toDataURL('image/png'));
      };

      logoImg.onerror = () => {
        resolve(qrDataUrl);
      };

      logoImg.src = logoSrc;
    };

    qrImg.onerror = () => {
      resolve(qrDataUrl);
    };

    qrImg.src = qrDataUrl;
  });
}
