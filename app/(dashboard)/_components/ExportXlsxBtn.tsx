'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { GetAllFormSubmissionsForExport } from '@/app/actions/form';
import { toast } from '@/components/ui/use-toast';

interface Column {
  id: string;
  label: string;
}

interface ExportXlsxBtnProps {
  formTitle: string;
  columns: Column[];
  rows?: Record<string, any>[];
  formId?: number | string;
  shareUrl?: string;
}

export default function ExportXlsxBtn({
  formTitle,
  columns,
  rows = [],
  formId,
  shareUrl,
}: ExportXlsxBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      let targetRows = rows;

      // Fetch ALL submissions in one go if formId or shareUrl is provided
      const targetIdentifier = formId || shareUrl;
      if (targetIdentifier) {
        try {
          const res = await GetAllFormSubmissionsForExport(targetIdentifier);
          if (res?.submissions && Array.isArray(res.submissions) && res.submissions.length > 0) {
            targetRows = res.submissions.map((sub: any) => {
              let content: any = {};
              try {
                content = JSON.parse(sub.content || '{}');
              } catch {
                content = {};
              }

              const respondent = sub.employee
                ? `${sub.employee.firstName || ''} ${sub.employee.lastName || ''} (${sub.employee.employeeId || ''})`.trim()
                : (sub.clerkUserId ? 'Logged-in User' : 'Anonymous');

              return {
                ...content,
                respondent: respondent || 'Anonymous',
                submitted: sub.submittedAt || sub.createdAt,
              };
            });
          }
        } catch (fetchErr: any) {
          console.warn('[ExportXlsxBtn] Full submissions fetch warning, falling back to loaded rows:', fetchErr);
        }
      }

      if (!targetRows || targetRows.length === 0) {
        toast({
          title: 'No submissions',
          description: 'No submissions available to export.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const excelData = targetRows.map((row) => {
        const formattedRow: Record<string, any> = {
          'Submitted By': row.respondent || 'Anonymous',
        };

        columns.forEach((col) => {
          let val = row[col.id];

          if (val === undefined || val === null) {
            val = '';
          } else if (typeof val === 'boolean') {
            val = val ? 'Yes' : 'No';
          } else if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              if (typeof parsed === 'object' && parsed !== null) {
                val = parsed.formatted || parsed.name || parsed.url || parsed.dataUrl || JSON.stringify(parsed);
              }
            } catch {
              // keep original string
            }
          } else if (typeof val === 'object') {
            val = val.formatted || val.name || val.url || val.dataUrl || JSON.stringify(val);
          }

          formattedRow[col.label || col.id] = val;
        });

        formattedRow['Submitted At'] = row.submitted
          ? new Date(row.submitted).toLocaleString()
          : '';

        return formattedRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-fit column widths
      const colWidths = Object.keys(excelData[0] || {}).map((key) => {
        let maxLen = key.length;
        excelData.forEach((row) => {
          const valStr = String(row[key] || '');
          if (valStr.length > maxLen) {
            maxLen = valStr.length;
          }
        });
        return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
      });

      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

      const cleanTitle = (formTitle || 'Form').replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(workbook, `${cleanTitle}_All_Responses.xlsx`);

      toast({
        title: 'Export Complete',
        description: `Exported ${excelData.length} total responses to Excel.`,
      });
    } catch (err: any) {
      console.error('[ExportXlsxBtn Error]:', err);
      toast({
        title: 'Export Failed',
        description: err?.message || 'Failed to export Excel file.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2 border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span>Exporting All Responses...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export Full Excel (.xlsx)</span>
          <Download className="h-3.5 w-3.5 opacity-70" />
        </>
      )}
    </Button>
  );
}
