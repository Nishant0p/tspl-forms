'use client';

import { buildFormSubmitUrl } from '@/lib/url';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { generateBrandedQRCode } from '@/lib/qr';
import { Check, Copy, Download, ExternalLink, Share2, QrCodeIcon } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';

export type FormShareDialogForm = {
  id?: number;
  name?: string;
  shareUrl: string;
  accessMode?: 'PUBLIC' | 'AUTHENTICATED' | 'RESTRICTED' | null;
  status?: string | null;
  published?: boolean | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  responseLimit?: number | null;
};

function formatDate(value?: Date | string | null) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatAccessLabel(accessMode?: FormShareDialogForm['accessMode']) {
  switch (accessMode) {
    case 'PUBLIC':
      return 'PUBLIC';
    case 'AUTHENTICATED':
      return 'AUTHENTICATED';
    case 'RESTRICTED':
      return 'RESTRICTED';
    default:
      return 'PUBLIC';
  }
}

export default function FormShareDialog({ form, trigger }: { form: FormShareDialogForm; trigger?: ReactNode }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => buildFormSubmitUrl(form.shareUrl, 'link'), [form.shareUrl]);
  const qrUrl = useMemo(() => buildFormSubmitUrl(form.shareUrl, 'qr'), [form.shareUrl]);
  const status = form.status || (form.published ? 'PUBLISHED' : 'DRAFT');
  const isDraft = status === 'DRAFT' || !form.published;

  useEffect(() => {
    async function generateQr() {
      try {
        const dataUrl = await generateBrandedQRCode(qrUrl, { width: 360, margin: 2 });
        setQrDataUrl(dataUrl);
      } catch (error) {
        setQrDataUrl('');
      }
    }

    generateQr();
  }, [qrUrl]);

  async function copyLink() {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'The form URL is now in your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the form URL automatically.',
        variant: 'destructive',
      });
    }
  }

  function openForm() {
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function downloadQr() {
    if (!qrDataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${(form.name || 'form').replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.click();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Use the form URL or QR code to share the submission page with respondents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Form URL</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input value={shareUrl} readOnly className="min-w-0 flex-1" />
              <Button onClick={copyLink} variant={copied ? "default" : "secondary"} className="shrink-0 transition-all">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openForm} variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open form
              </Button>
            </div>
          </div>

          {isDraft && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
              This form is not published yet.
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-center rounded-xl bg-white p-3 shadow-sm">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Form QR code" className="h-40 w-40 rounded-md object-contain" />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
                    <QrCodeIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <Button onClick={downloadQr} variant="outline" className="w-full gap-2" disabled={!qrDataUrl}>
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-muted-foreground">Access mode</div>
                  <div className="mt-1 font-semibold">{formatAccessLabel(form.accessMode)}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-muted-foreground">Form status</div>
                  <div className="mt-1 font-semibold">{status}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-muted-foreground">Start date</div>
                  <div className="mt-1 font-semibold">{formatDate(form.startDate)}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-muted-foreground">End date</div>
                  <div className="mt-1 font-semibold">{formatDate(form.endDate)}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2">
                  <div className="text-muted-foreground">Response limit</div>
                  <div className="mt-1 font-semibold">
                    {typeof form.responseLimit === 'number' && form.responseLimit >= 0
                      ? form.responseLimit.toLocaleString()
                      : 'No limit'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
