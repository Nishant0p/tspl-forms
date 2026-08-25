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

import DeleteFormBtn from './DeleteFormBtn';

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
          <CardDescription className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              {formatDistance(form.createdAt, new Date(), {
                addSuffix: true,
              })}
            </span>
            {form.published && (
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{form.visits.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1" title="Responses">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{form.submissions.toLocaleString()}</span>
                </span>
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
            className="w-full gap-4 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 shadow-sm transition-colors">
            <Link href={`/forms/${form.id}`}>
              View submissions <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {!form.published && (
          <div className="flex w-full items-center gap-2">
            <Button
              asChild
              className="flex-1 gap-2 text-sm text-zinc-50">
              <Link href={`/builder/${form.id}`}>
                Edit Form <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteFormBtn formId={form.id} formName={form.name} iconOnly />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
