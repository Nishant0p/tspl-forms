'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function VisitBtn({ shareUrl, iconOnly }: { shareUrl: string; iconOnly?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (iconOnly) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Visit Form" asChild>
        <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
          <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={'secondary'}
      asChild>
      <Link
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer">
        <Globe className="mr-2 h-4 w-4" />
        Visit Form
      </Link>
    </Button>
  );
}
