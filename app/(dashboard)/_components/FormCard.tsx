'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@prisma/client';
import { formatDistance } from 'date-fns';
import { ArrowRight, Edit, Eye, StickyNote } from 'lucide-react';
import Link from 'next/link';

export default function FormCard({ form }: { form: Form }) {
  return (
    <Card className="min-h-[195px] flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate text-xl font-bold">{form.name}</span>
            {form.published && <Badge className='text-zinc-50'>Published</Badge>}
            {!form.published && <Badge variant={'destructive'}>Draft</Badge>}
          </CardTitle>
          <CardDescription>
            {formatDistance(form.createdAt, new Date(), {
              addSuffix: true,
            })}
            {form.published && (
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{form.visits.toLocaleString()}</span>
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <span>{form.submissions.toLocaleString()}</span>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
          {form.description || 'No description provided'}
        </CardContent>
      </div>
      <CardFooter className='flex-col gap-2 pt-4'>
        {form.published && (
          <Button
            asChild
            className="w-full gap-4 text-sm text-zinc-50">
            <Link href={`/forms/${form.id}`}>
              View submissions <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {!form.published && (
          <Button
            asChild
            className="w-full gap-4 text-sm text-zinc-50">
            <Link href={`/builder/${form.id}`}>
              Edit Form <Edit className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
