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
import { ArrowRight, Edit, Eye, FileText, GitBranch, Layout, Star, StickyNote, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import DeleteFormBtn from './DeleteFormBtn';
import FormCollaboratorsModal from '@/components/FormCollaboratorsModal';

function FormMiniPreview({ contentJson, formName }: { contentJson: string; formName?: string }) {
  let elements: any[] = [];
  try {
    if (contentJson) {
      elements = JSON.parse(contentJson);
    }
  } catch (e) {
    elements = [];
  }

  // Filter banner if present to show at very top of mini sheet
  const bannerEl = elements.find((el) => el.type === 'BannerField');
  const themeEl = elements.find((el) => el.type === 'ThemeField');
  const normalElements = elements.filter(
    (el) => el.type !== 'BannerField' && el.type !== 'ThankYouField' && el.type !== 'ThemeField'
  );
  const previewElements = normalElements.slice(0, 4); // Show up to 4 fields in mini scaled preview

  const primaryColor = themeEl?.extraAttributes?.primaryColor;

  return (
    <div className="relative h-[115px] sm:h-[132px] w-full bg-gradient-to-br from-primary/10 via-muted/40 to-orange-500/10 border-b p-2 sm:p-2.5 flex flex-col justify-start gap-1 overflow-hidden group-hover:border-primary/30 transition-colors">
      {/* Top watermark badge */}
      <div className="flex items-center justify-between shrink-0 mb-1 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground backdrop-blur-xs border border-border/50 shadow-2xs">
          <FileText className="h-2.5 w-2.5 text-primary" />
          Mini Preview
        </span>
        <span className="text-[9px] text-muted-foreground font-mono font-medium bg-background/70 px-1.5 py-0.5 rounded-full border border-border/40">
          {normalElements.length} {normalElements.length === 1 ? 'field' : 'fields'}
        </span>
      </div>

      {/* Mini Scaled Form Document */}
      {previewElements.length > 0 ? (
        <div className="relative flex-1 w-full overflow-hidden rounded-md bg-background/95 dark:bg-zinc-900/95 border border-border/70 shadow-xs">
          {/* Top color accent strip / banner */}
          {bannerEl?.extraAttributes?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerEl.extraAttributes.imageUrl}
              alt="Banner"
              className="h-3 w-full object-cover shrink-0"
            />
          ) : primaryColor ? (
            <div
              style={{ backgroundColor: primaryColor }}
              className="h-1.5 w-full shrink-0"
            />
          ) : (
            <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-orange-500 shrink-0" />
          )}

          {/* Scaled-down inner form content */}
          <div className="w-[175%] origin-top-left scale-[0.57] p-2 space-y-1.5 pointer-events-none select-none">
            {/* Form Title in miniature */}
            {formName && (
              <div className="text-[11px] font-bold text-foreground/90 truncate pb-0.5 border-b border-border/40">
                {formName}
              </div>
            )}

            {previewElements.map((el, idx) => {
              const label = el.extraAttributes?.label || el.extraAttributes?.title || el.type;
              const placeholder = el.extraAttributes?.placeholder || 'Input value...';
              const required = el.extraAttributes?.required;

              return (
                <div
                  key={idx}
                  className="rounded border border-border/50 bg-muted/20 dark:bg-muted/10 p-1.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-foreground/80 truncate max-w-[240px]">
                      {label}
                      {required && <span className="text-destructive ml-0.5">*</span>}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground/60 font-mono">
                      {el.type.replace('Field', '')}
                    </span>
                  </div>

                  {/* Micro Field Representation */}
                  {el.type === 'RadioField' ? (
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full border border-primary flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                        </div>
                        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
                          {el.extraAttributes?.options?.[0] || 'Option 1'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full border border-muted-foreground/40" />
                        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
                          {el.extraAttributes?.options?.[1] || 'Option 2'}
                        </span>
                      </div>
                    </div>
                  ) : el.type === 'CheckboxField' ? (
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded border border-primary bg-primary/20 flex items-center justify-center">
                          <div className="h-1 w-1 rounded-xs bg-primary" />
                        </div>
                        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
                          {el.extraAttributes?.options?.[0] || 'Option 1'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded border border-muted-foreground/40" />
                        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
                          {el.extraAttributes?.options?.[1] || 'Option 2'}
                        </span>
                      </div>
                    </div>
                  ) : el.type === 'RatingField' ? (
                    <div className="flex items-center gap-0.5 pt-0.5 text-amber-500">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                      <Star className="h-2.5 w-2.5 text-muted-foreground/30" />
                    </div>
                  ) : el.type === 'LinearScaleField' ? (
                    <div className="flex items-center gap-1 pt-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div
                          key={num}
                          className="h-3.5 w-4 rounded border border-border/70 bg-background flex items-center justify-center text-[8px] font-medium text-muted-foreground"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  ) : ['TitleField', 'SubTitleField', 'SectionHeaderField'].includes(el.type) ? (
                    <div className="text-[10px] font-bold text-primary truncate">
                      {el.extraAttributes?.title || label}
                    </div>
                  ) : ['SelectField', 'TsplRangeDropdownField', 'TsplEducationField'].includes(el.type) ? (
                    <div className="h-4 w-full rounded border border-border/60 bg-background/80 px-1.5 text-[9px] text-muted-foreground flex items-center justify-between">
                      <span className="truncate">{placeholder || 'Select option...'}</span>
                      <span className="text-[8px] opacity-60">▼</span>
                    </div>
                  ) : el.type === 'ConditionField' ? (
                    <div className="flex items-center gap-1.5 text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{el.extraAttributes?.label || 'Condition Decision'}</span>
                    </div>
                  ) : el.type === 'TsplConsentField' ? (
                    <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground pt-0.5">
                      <div className="h-2.5 w-2.5 rounded border border-primary/50 bg-primary/10 shrink-0" />
                      <span className="truncate">{el.extraAttributes?.agreementLabel || 'I agree and accept'}</span>
                    </div>
                  ) : el.type === 'TextAreaField' ? (
                    <div className="h-6 w-full rounded border border-border/60 bg-background/80 p-1 text-[8px] text-muted-foreground flex flex-col justify-start">
                      <span className="truncate opacity-70">{placeholder}</span>
                    </div>
                  ) : (
                    <div className="h-4 w-full rounded border border-border/60 bg-background/80 px-1.5 text-[9px] text-muted-foreground flex items-center truncate">
                      {placeholder}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom subtle gradient fade */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-1 text-xs py-3">
          <Layout className="h-5 w-5 stroke-1" />
          <span className="text-[10px]">No elements in form</span>
        </div>
      )}
    </div>
  );
}

export default function FormCard({ form, isAdmin = false }: { form: Form; isAdmin?: boolean }) {
  const userName = (form as any).user?.name || (form as any).createdByName || (form as any).userId || 'User';

  return (
    <Card className="min-h-[260px] flex flex-col justify-between overflow-hidden group hover:shadow-md transition-shadow rounded-xl">
      <div>
        {/* Form Mini Preview above Form Name */}
        <FormMiniPreview contentJson={form.content} formName={form.name} />

        <CardHeader className="p-3.5 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="flex items-start justify-between gap-2">
            <span className="truncate text-base sm:text-lg font-bold" title={form.name}>{form.name}</span>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
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
          <CardDescription className="flex items-center justify-between text-xs text-muted-foreground pt-1 gap-2">
            <span className="truncate">
              {formatDistance(form.createdAt, new Date(), {
                addSuffix: true,
              })}
            </span>
            {form.published && (
              <span className="flex items-center gap-2.5 shrink-0">
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono">{form.visits.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1" title="Responses">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono">{form.submissions.toLocaleString()}</span>
                </span>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-4 py-1 h-[28px] truncate text-xs text-muted-foreground">
          {form.description || 'No description provided'}
        </CardContent>
      </div>
      <CardFooter className="flex flex-col gap-2.5 p-3.5 sm:p-4 pt-2">
        {form.published && (
          <>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                asChild
                variant="outline"
                className="w-full min-h-[38px] gap-1.5 text-xs font-semibold hover:border-primary">
                <Link href={`/builder/${form.id}`}>
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  Edit Form
                </Link>
              </Button>
              <Button
                asChild
                className="w-full min-h-[38px] gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 shadow-sm transition-colors">
                <Link href={`/forms/${form.id}`}>
                  Submissions <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col w-full gap-2 pt-2 border-t border-border/60">
              <div className="flex w-full items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="text-[11px] font-medium text-muted-foreground">Actions</span>
                <span className="text-[11px] text-muted-foreground truncate text-right max-w-[190px]" title={`created by ${userName}`}>
                  created by <span className="font-semibold text-foreground/90">{userName}</span>
                </span>
              </div>
              <div className={cn("grid gap-2 w-full", isAdmin ? "grid-cols-2" : "grid-cols-1")}>
                {isAdmin && (
                  <FormCollaboratorsModal
                    formId={form.id}
                    formName={form.name}
                    shareUrl={form.shareUrl}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full min-h-[38px] gap-1.5 text-xs font-semibold border-blue-500/30 text-blue-600 hover:border-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
                      >
                        <Users className="h-4 w-4" />
                        <span>Collaborators</span>
                      </Button>
                    }
                  />
                )}
                <DeleteFormBtn
                  formId={form.id}
                  formName={form.name}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full min-h-[38px] gap-1.5 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </>
        )}
        {!form.published && (
          <div className="flex flex-col w-full gap-2">
            {/* Big Edit Form button on top */}
            <Button
              asChild
              className="w-full min-h-[38px] gap-2 text-xs sm:text-sm font-semibold text-zinc-50 bg-primary hover:bg-primary/90 shadow-sm">
              <Link href={`/builder/${form.id}`}>
                Edit Form <Edit className="h-4 w-4" />
              </Link>
            </Button>

            {/* Actions & Creator Header */}
            <div className="flex flex-col w-full gap-2 pt-2 border-t border-border/60">
              <div className="flex w-full items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="text-[11px] font-medium text-muted-foreground">Actions</span>
                <span className="text-[11px] text-muted-foreground truncate text-right max-w-[190px]" title={`created by ${userName}`}>
                  created by <span className="font-semibold text-foreground/90">{userName}</span>
                </span>
              </div>

              {/* Bottom two buttons bigger side-by-side */}
              <div className={cn("grid gap-2 w-full", isAdmin ? "grid-cols-2" : "grid-cols-1")}>
                {isAdmin && (
                  <FormCollaboratorsModal
                    formId={form.id}
                    formName={form.name}
                    shareUrl={form.shareUrl}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full min-h-[38px] gap-1.5 text-xs font-semibold border-blue-500/30 text-blue-600 hover:border-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
                      >
                        <Users className="h-4 w-4" />
                        <span>Collaborators</span>
                      </Button>
                    }
                  />
                )}
                <DeleteFormBtn
                  formId={form.id}
                  formName={form.name}
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full min-h-[38px] gap-1.5 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
