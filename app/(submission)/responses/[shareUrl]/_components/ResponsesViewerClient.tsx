'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ExportXlsxBtn from '@/app/(dashboard)/_components/ExportXlsxBtn';
import FileViewerModal from '@/components/FileViewerModal';
import {
  Eye,
  StickyNote,
  MousePointerClick,
  Star,
  Search,
  Lock,
  Calendar,
  Clock,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  FilterX,
} from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { ElementsType, FormElementInstance } from '@/app/(dashboard)/_components/FormElements';

interface ResponsesViewerClientProps {
  form: {
    id: number;
    name: string;
    description: string;
    visits: number;
    submissions: number;
    content: string;
    shareUrl: string;
    status: string;
    published: boolean;
    createdAt: Date | string;
    FormSubmissions: any[];
  };
}

export default function ResponsesViewerClient({ form }: ResponsesViewerClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { visits = 0, submissions = 0, FormSubmissions = [] } = form;
  const submissionsRate = visits > 0 ? ((submissions / visits) * 100).toFixed(1) : '0';

  // Parse form schema to extract column definitions
  const columns = useMemo(() => {
    let elements: FormElementInstance[] = [];
    try {
      elements = JSON.parse(form.content || '[]');
    } catch {
      elements = [];
    }

    const cols: {
      id: string;
      label: string;
      type: ElementsType;
      required: boolean;
    }[] = [];

    elements.forEach((el) => {
      switch (el.type) {
        case 'TextField':
        case 'EmailField':
        case 'PhoneField':
        case 'NumberField':
        case 'TextAreaField':
        case 'DateField':
        case 'TimeField':
        case 'SelectField':
        case 'RadioField':
        case 'CheckboxField':
        case 'RatingField':
        case 'LinearScaleField':
        case 'FileUploadField':
        case 'SignatureField':
        case 'ImageField':
        case 'VideoField':
        case 'TsplEmailField':
        case 'TsplMobileField':
        case 'TsplCurrentDateTimeField':
        case 'TsplDobAgeField':
        case 'TsplRangeDropdownField':
        case 'TsplEducationField':
        case 'TsplFullNameField':
        case 'TsplConsentField':
          cols.push({
            id: el.id,
            label: el.extraAttributes?.label || el.extraAttributes?.title || el.type,
            type: el.type,
            required: Boolean(el.extraAttributes?.required),
          });
          break;
        case 'ConditionField':
          cols.push({
            id: el.id,
            label: el.extraAttributes?.label || el.extraAttributes?.title || el.type,
            type: el.type,
            required: Boolean(el.extraAttributes?.required),
          });
          if (el.extraAttributes?.optionQuestions) {
            const oq = el.extraAttributes.optionQuestions as Record<string, any[]>;
            Object.entries(oq).forEach(([optVal, qList]) => {
              if (Array.isArray(qList)) {
                qList.forEach((q) => {
                  if (q && q.id) {
                    cols.push({
                      id: `${el.id}_${q.id}`,
                      label: `[${optVal}] ${q.label || 'Question'}`,
                      required: Boolean(q.required),
                      type: (q.type === 'textarea'
                        ? 'TextAreaField'
                        : q.type === 'number'
                        ? 'NumberField'
                        : q.type === 'select'
                        ? 'SelectField'
                        : q.type === 'radio'
                        ? 'RadioField'
                        : q.type === 'date'
                        ? 'DateField'
                        : 'TextField') as ElementsType,
                    });
                  }
                });
              }
            });
          }
          break;
        default:
          break;
      }
    });

    return cols;
  }, [form.content]);

  // Parse submission rows
  const allRows = useMemo(() => {
    return FormSubmissions.map((sub: any) => {
      let content: Record<string, any> = {};
      try {
        content = JSON.parse(sub.content || '{}');
      } catch {
        content = {};
      }

      const respondent = sub.employee
        ? `${sub.employee.firstName} ${sub.employee.lastName} (${sub.employee.employeeId})`
        : 'Anonymous';

      return {
        ...content,
        id: sub.id,
        submitted: sub.submittedAt || sub.createdAt,
        respondent,
      };
    });
  }, [FormSubmissions]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allRows;

    return allRows.filter((row) => {
      if (row.respondent?.toLowerCase().includes(q)) return true;
      for (const col of columns) {
        const val = (row as any)[col.id];
        if (val !== undefined && val !== null) {
          if (String(val).toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [allRows, searchTerm, columns]);

  const latestSubmission = FormSubmissions.length > 0 ? FormSubmissions[0]?.createdAt : null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold truncate max-w-[280px] sm:max-w-md">
                  {form.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold shrink-0">
                  <Lock className="h-3 w-3" /> View-Only Responses
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[320px] sm:max-w-lg">
                {form.description || 'Live responses summary and submitted records.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <ExportXlsxBtn formTitle={form.name} columns={columns} rows={allRows} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Read-Only Access Notice Banner */}
        <div className="flex items-center justify-between flex-wrap gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Secured Read-Only Mode:</strong> You have permission to view responses, inspect data, and export to Excel. Form builder and settings modifications are disabled.
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            TSPL Verified
          </span>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Total Responses
              </p>
              <h3 className="text-2xl font-black text-foreground">
                {submissions.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Form Views
              </p>
              <h3 className="text-2xl font-black text-foreground">
                {visits.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MousePointerClick className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Completion Rate
              </p>
              <h3 className="text-2xl font-black text-foreground">
                {submissionsRate}%
              </h3>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Last Activity
              </p>
              <h3 className="text-sm font-bold text-foreground">
                {latestSubmission
                  ? formatDistance(new Date(latestSubmission), new Date(), { addSuffix: true })
                  : 'No submissions'}
              </h3>
            </div>
          </div>
        </div>

        {/* Responses Table Card */}
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          {/* Table Controls */}
          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs bg-background"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground self-end sm:self-auto">
              <span>
                Showing <strong>{filteredRows.length}</strong> of <strong>{allRows.length}</strong> submissions
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur">
                <TableRow>
                  <TableHead className="w-12 text-center text-[11px] font-bold text-muted-foreground uppercase">
                    #
                  </TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-foreground min-w-[140px]">
                    Submitted By
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.id} className="uppercase text-[11px] font-bold text-foreground min-w-[160px]">
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right uppercase text-[11px] font-bold text-muted-foreground min-w-[130px]">
                    Submitted At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 3} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        {searchTerm ? (
                          <>
                            <FilterX className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm font-semibold">No responses matched your search</p>
                            <p className="text-xs">Try searching for a different name, keyword, or clear your query.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm('')}
                              className="mt-1 text-xs"
                            >
                              Clear Filter
                            </Button>
                          </>
                        ) : (
                          <>
                            <StickyNote className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm font-semibold">No responses recorded yet</p>
                            <p className="text-xs">Responses will automatically appear here once users submit the form.</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row: any, idx: number) => (
                    <TableRow key={row.id || idx} className="hover:bg-muted/30 text-xs transition-colors">
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {row.respondent}
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.id}>
                          {renderCellValue(col.type, row[col.id])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                        {row.submitted ? (
                          <span title={format(new Date(row.submitted), 'PPpp')}>
                            {formatDistance(new Date(row.submitted), new Date(), { addSuffix: true })}
                          </span>
                        ) : (
                          'Just now'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}

function renderCellValue(type: ElementsType, value: any) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-muted-foreground/40">—</span>;
  }

  switch (type) {
    case 'DateField':
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return (
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {format(d, 'dd/MM/yyyy')}
            </span>
          );
        }
      } catch {
        return <span>{value}</span>;
      }
      return <span>{value}</span>;

    case 'RatingField':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-500" /> {value}
        </span>
      );

    case 'CheckboxField':
      return <Checkbox checked={value === 'true' || value === true} disabled className="h-4 w-4" />;

    case 'FileUploadField':
    case 'ImageField':
    case 'SignatureField':
      try {
        const parsed = JSON.parse(value);
        if (parsed?.dataUrl) {
          return (
            <FileViewerModal
              fileUrl={parsed.dataUrl}
              fileName={parsed.name || `${type === 'SignatureField' ? 'Signature' : 'Document'}`}
              fileType={parsed.type || 'image'}
            />
          );
        }
      } catch {
        // Raw string
      }
      return <span className="truncate max-w-[140px] inline-block">{String(value)}</span>;

    default:
      return <span className="truncate max-w-[180px] inline-block">{String(value)}</span>;
  }
}
