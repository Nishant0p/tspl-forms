'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, ExternalLink, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface FileViewerModalProps {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  trigger?: React.ReactNode;
  title?: string;
}

// Convert base64 data URL to a binary Blob safely in chunks to avoid call stack limits
function b64toBlob(dataUrl: string, defaultMime = 'application/pdf'): Blob | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : defaultMime;
    const base64Data = parts[1];

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([byteNumbers.buffer as ArrayBuffer], { type: mime });
  } catch (err) {
    console.error('Failed to convert base64 to Blob:', err);
    return null;
  }
}

export default function FileViewerModal({
  fileUrl,
  fileName = 'File Preview',
  fileType,
  trigger,
  title,
}: FileViewerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  if (!fileUrl) return null;

  // Determine file type
  const lowerUrl = fileUrl.toLowerCase();
  const lowerName = fileName.toLowerCase();
  const lowerType = (fileType || '').toLowerCase();

  const isPdf =
    lowerUrl.startsWith('data:application/pdf') ||
    lowerName.endsWith('.pdf') ||
    lowerType.includes('pdf');

  const isImage =
    lowerUrl.startsWith('data:image/') ||
    /\.(png|jpe?g|gif|webp|svg|bmp|ico)/i.test(lowerName) ||
    lowerType.includes('image');

  const isVideo =
    lowerUrl.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov|mkv)/i.test(lowerName) ||
    lowerType.includes('video');

  // Sanitize file URL to prevent javascript: or dangerous protocol injection
  const isDangerousScheme =
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('vbscript:') ||
    lowerUrl.startsWith('data:text/html');

  // Create an active blob URL when modal is open to bypass Chrome data-URL iframe & navigation restrictions
  useEffect(() => {
    if (!isOpen || isDangerousScheme) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    if (fileUrl.startsWith('data:')) {
      const targetMime = isPdf
        ? 'application/pdf'
        : isImage
        ? 'image/png'
        : isVideo
        ? 'video/mp4'
        : 'application/octet-stream';

      const blob = b64toBlob(fileUrl, targetMime);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);

        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      }
    } else {
      setBlobUrl(fileUrl);
    }
  }, [isOpen, fileUrl, isPdf, isImage, isVideo, isDangerousScheme]);

  const activeDisplayUrl = blobUrl || fileUrl;

  const handleDownload = () => {
    if (isDangerousScheme) return;

    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (fileUrl.startsWith('data:')) {
      const blob = b64toBlob(fileUrl);
      if (blob) {
        const tempUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = tempUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
        return;
      }
    }

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (isDangerousScheme) return;

    if (blobUrl) {
      window.open(blobUrl, '_blank');
      return;
    }

    if (fileUrl.startsWith('data:')) {
      const blob = b64toBlob(fileUrl, isPdf ? 'application/pdf' : 'application/octet-stream');
      if (blob) {
        const tempUrl = URL.createObjectURL(blob);
        window.open(tempUrl, '_blank');
        return;
      }
    }

    window.open(fileUrl, '_blank');
  };

  const renderIcon = () => {
    if (isPdf) return <FileText className="h-4 w-4 text-red-500" />;
    if (isImage) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (isVideo) return <VideoIcon className="h-4 w-4 text-purple-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border space-y-0 pr-6">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold truncate max-w-[70%]">
            {renderIcon()}
            <span className="truncate">{title || fileName}</span>
          </DialogTitle>

          <div className="flex items-center gap-2 mr-2">
            {!isDangerousScheme && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 h-8 font-medium transition-colors"
                  title="Download file"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 h-8 font-medium transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 w-full overflow-auto pt-4 flex items-center justify-center min-h-[400px]">
          {isDangerousScheme ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
              <FileText className="h-12 w-12 text-destructive mb-3" />
              <h3 className="font-semibold text-foreground text-sm">Preview Blocked</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This file format contains executable code and cannot be safely previewed in the browser.
              </p>
            </div>
          ) : isPdf ? (
            <div className="w-full h-[65vh] flex flex-col rounded-md border border-border bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
              <object
                data={activeDisplayUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                {/* Fallback if browser's native PDF plugin is disabled or unsupported */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3 bg-muted/20">
                  <FileText className="h-12 w-12 text-red-500" />
                  <h3 className="font-semibold text-foreground text-sm">{fileName}</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Your browser could not preview this PDF inline. You can open it in a new tab or download it directly.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button onClick={handleOpenNewTab} size="sm" className="gap-1.5 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
                    </Button>
                    <Button onClick={handleDownload} size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center p-2 max-h-[65vh] w-full bg-slate-950/5 dark:bg-slate-950/40 rounded-lg">
              <img
                src={activeDisplayUrl}
                alt={fileName}
                className="max-h-[60vh] max-w-full object-contain rounded shadow-sm"
              />
            </div>
          ) : isVideo ? (
            <div className="flex items-center justify-center p-2 max-h-[65vh] w-full bg-black rounded-lg">
              <video
                src={activeDisplayUrl}
                controls
                autoPlay
                className="max-h-[60vh] max-w-full rounded shadow-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-muted/20 rounded-lg border border-border">
              <FileText className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-foreground text-sm">{fileName}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                This document cannot be previewed directly. Please download to view it.
              </p>
              <Button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Document
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
