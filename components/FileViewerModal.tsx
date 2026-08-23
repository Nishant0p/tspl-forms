'use client';

import React, { useState } from 'react';
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

export default function FileViewerModal({
  fileUrl,
  fileName = 'File Preview',
  fileType,
  trigger,
  title,
}: FileViewerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              title="Download file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full overflow-auto pt-4 flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[65vh] rounded-md border border-border bg-white dark:bg-zinc-900"
            />
          ) : isImage ? (
            <div className="flex items-center justify-center p-2 max-h-[65vh] w-full bg-slate-950/5 dark:bg-slate-950/40 rounded-lg">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-[60vh] max-w-full object-contain rounded shadow-sm"
              />
            </div>
          ) : isVideo ? (
            <div className="flex items-center justify-center p-2 max-h-[65vh] w-full bg-black rounded-lg">
              <video
                src={fileUrl}
                controls
                autoPlay
                className="max-h-[60vh] max-w-full rounded shadow-sm"
              />
            </div>
          ) : (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[65vh] rounded-md border border-border bg-white dark:bg-zinc-900"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
