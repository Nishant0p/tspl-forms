'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { generateBrandedQRCode } from '@/lib/qr';
import { Check, Copy, Download, ExternalLink, QrCodeIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function normalizeShareUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

export default function FormLinkShare({ shareUrl }: { shareUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedShareUrl = useMemo(() => normalizeShareUrl(shareUrl), [shareUrl]);

  const qrUrl = useMemo(() => {
    try {
      const url = new URL(resolvedShareUrl);
      url.searchParams.set('source', 'qr');
      return url.toString();
    } catch {
      return resolvedShareUrl;
    }
  }, [resolvedShareUrl]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    async function generateQr() {
      try {
        const dataUrl = await generateBrandedQRCode(qrUrl, { width: 240, margin: 2 });
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl('');
      }
    }

    generateQr();
  }, [mounted, qrUrl]);

  if (!mounted) {
    return null;
  }

  async function copyLink() {
    const success = await copyToClipboard(resolvedShareUrl);
    if (success) {
      setCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'You can now paste the link anywhere you want.',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the form URL automatically. Please copy manually.',
        variant: 'destructive',
      });
    }
  }

  function openForm() {
    window.open(resolvedShareUrl, '_blank', 'noopener,noreferrer');
  }

  function downloadQr() {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'form-qr.png';
    link.click();
  }

  return (
    <div className="flex grow flex-col gap-3">
      <div className="flex items-center gap-3">
        <Input value={resolvedShareUrl} readOnly className="min-w-0 flex-1" />
        <div className="flex flex-wrap gap-2">
          <Button variant={copied ? "default" : "secondary"} onClick={copyLink} className="transition-all">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" onClick={openForm}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open form
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Form QR code" className="h-full w-full object-contain" />
            ) : (
              <QrCodeIcon className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">QR code</p>
            <p className="text-xs text-muted-foreground">Scan to open the public form</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={downloadQr} disabled={!qrDataUrl} className="gap-2">
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
