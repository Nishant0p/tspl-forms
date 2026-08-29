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
import { ArrowRight, Edit, Eye, FileText, GitBranch, Layout, StickyNote } from 'lucide-react';
import Link from 'next/link';

import DeleteFormBtn from './DeleteFormBtn';

function FormMiniPreview({ contentJson }: { contentJson: string }) {
  let elements: any[] = [];
  try {
    if (contentJson) {
      elements = JSON.parse(contentJson);
    }
  } catch (e) {
    elements = [];
  }

  const previewElements = elements.slice(0, 2); // Show first 2 fields in mini preview

  return (
    <div className="relative h-[132px] w-full bg-gradient-to-br from-primary/10 via-muted/40 to-orange-500/10 border-b p-3 flex flex-col justify-start gap-1 overflow-hidden group-hover:border-primary/30 transition-colors">
      {/* Top watermark badge */}
      <div className="flex items-center justify-between shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-xs border border-border/50">
          <FileText className="h-3 w-3 text-primary" />
          Mini Preview
        </span>
        <span className="text-[10px] text-muted-foreground font-mono font-medium">
          {elements.length} {elements.length === 1 ? 'field' : 'fields'}
        </span>
      </div>

      {/* Mini Form Fields Render */}
      {previewElements.length > 0 ? (
        <div className="space-y-1 opacity-90 pointer-events-none mt-0.5">
          {previewElements.map((el, idx) => {
            const label = el.extraAttributes?.label || el.extraAttributes?.title || el.type;
            const placeholder = el.extraAttributes?.placeholder || 'Input value...';
            return (
              <div key={idx} className="space-y-0.5">
                <div className="text-[10px] font-semibold text-foreground/80 truncate max-w-[220px]">
                  {label}
                </div>
                {['TitleField', 'SubTitleField', 'SectionHeaderField'].includes(el.type) ? (
                  <div className="text-[10px] font-bold text-primary truncate max-w-[220px]">
                    {el.extraAttributes?.title || label}
                  </div>
                ) : el.type === 'CheckboxField' ? (
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded border border-primary/40 bg-background/60" />
                    <span className="text-[9px] text-muted-foreground truncate">{label}</span>
                  </div>
                ) : (
                  <div className="h-3.5 w-full rounded border border-border/60 bg-background/80 px-1.5 text-[9px] text-muted-foreground flex items-center truncate">
                    {placeholder}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-1 text-xs py-4">
          <Layout className="h-5 w-5 stroke-1" />
          <span className="text-[10px]">No elements in form</span>
        </div>
      )}
    </div>
  );
}

export default function FormCard({ form }: { form: Form }) {
  return (
    <Card className="min-h-[260px] flex flex-col justify-between overflow-hidden group hover:shadow-md transition-shadow">
      <div>
        {/* Form Mini Preview above Form Name */}
        <FormMiniPreview contentJson={form.content} />

        <CardHeader className="pt-3 pb-2">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate text-lg font-bold" title={form.name}>{form.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {(form as any).branch && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {(form as any).branch.name}
                </Badge>
              )}
              {form.published && <Badge className="text-zinc-50 text-[10px] px-2 py-0.5">Published</Badge>}
              {!form.published && <Badge variant="destructive" className="text-[10px] px-2 py-0.5">Draft</Badge>}
            </div>
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
        <CardContent className="h-[24px] truncate text-xs text-muted-foreground">
          {form.description || 'No description provided'}
        </CardContent>
      </div>
      <CardFooter className="flex-col gap-2 pt-3 pb-3">
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
