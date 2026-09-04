'use client';

import React, { useState, useEffect } from 'react';
import { GetFormSubmissions } from '@/app/actions/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, formatDistance } from 'date-fns';
import {
  Eye,
  StickyNote,
  MousePointerClick,
  LogOut,
  Star,
  FileSpreadsheet,
  Loader2,
  Calendar,
} from 'lucide-react';
import ExportXlsxBtn from './ExportXlsxBtn';
import FileViewerModal from '@/components/FileViewerModal';
import { Checkbox } from '@/components/ui/checkbox';
import { FormElementInstance, ElementsType } from './FormElements';

export default function FormBuilderResponsesTab({ formId }: { formId: number }) {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetFormSubmissions(formId)
      .then((data) => {
        setFormData(data);
      })
      .catch((err) => {
        console.error('Failed to load submissions', err);
      })
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs">Loading responses...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-20 text-muted-foreground text-xs">
        No response data available.
      </div>
    );
  }

  const { visits = 0, submissions = 0, FormSubmissions = [] } = formData;
  const submissionsRate = visits > 0 ? ((submissions / visits) * 100).toFixed(1) : '0';

  let formElements: FormElementInstance[] = [];
  try {
    formElements = JSON.parse(formData.content || '[]');
  } catch {
    formElements = [];
  }

  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
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
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label || element.extraAttributes?.title || element.type,
          required: Boolean(element.extraAttributes?.required),
          type: element.type,
        });
        break;
      default:
        break;
    }
  });

  const rows = FormSubmissions.map((sub: any) => {
    let content: any = {};
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
      submitted: sub.submittedAt || sub.createdAt,
      respondent,
    };
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Response Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-5 rounded-xl border border-border shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-foreground">
              {FormSubmissions.length} Responses
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
              ● Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time collected submissions for this form.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExportXlsxBtn formTitle={formData.name} columns={columns} rows={rows} />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3.5 rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase">Total Views</p>
            <h4 className="text-xl font-bold">{visits.toLocaleString()}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <StickyNote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase">Submissions</p>
            <h4 className="text-xl font-bold">{submissions.toLocaleString()}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MousePointerClick className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase">Conversion Rate</p>
            <h4 className="text-xl font-bold">{submissionsRate}%</h4>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Responses Sheet</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {rows.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="uppercase text-[11px] font-bold">Submitted By</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.id} className="uppercase text-[11px] font-bold">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-right uppercase text-[11px] font-bold text-muted-foreground">
                  Submitted At
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="h-32 text-center text-muted-foreground text-xs">
                    No responses submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-muted/20 text-xs">
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
                        formatDistance(new Date(row.submitted), new Date(), { addSuffix: true })
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
    </div>
  );
}

function renderCellValue(type: ElementsType, value: any) {
  if (value === undefined || value === null || value === '') return <span className="text-muted-foreground/40">—</span>;

  switch (type) {
    case 'DateField':
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
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
      return <Checkbox checked={value === 'true' || value === true} disabled />;

    case 'FileUploadField':
    case 'ImageField':
    case 'SignatureField':
      try {
        const parsed = JSON.parse(value);
        if (parsed?.dataUrl) {
          return (
            <FileViewerModal
              fileUrl={parsed.dataUrl}
              fileName={parsed.name || 'View File'}
              fileType={parsed.type || 'image'}
            />
          );
        }
      } catch {
        // Raw string
      }
      return <span className="truncate max-w-[140px] inline-block">{String(value)}</span>;

    default:
      return <span className="truncate max-w-[160px] inline-block">{String(value)}</span>;
  }
}
