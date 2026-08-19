'use client';

import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Column {
  id: string;
  label: string;
}

interface ExportXlsxBtnProps {
  formTitle: string;
  columns: Column[];
  rows: Record<string, any>[];
}

export default function ExportXlsxBtn({ formTitle, columns, rows }: ExportXlsxBtnProps) {
  const handleExport = () => {
    if (!rows || rows.length === 0) {
      alert('No submissions available to export.');
      return;
    }

    const excelData = rows.map((row) => {
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
              val = parsed.name || parsed.dataUrl || JSON.stringify(parsed);
            }
          } catch {
            // keep original string
          }
        } else if (typeof val === 'object') {
          val = val.name || val.dataUrl || JSON.stringify(val);
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
    XLSX.writeFile(workbook, `${cleanTitle}_Responses.xlsx`);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="flex items-center gap-2 border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
    >
      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span>Export Excel (.xlsx)</span>
      <Download className="h-3.5 w-3.5 opacity-70" />
    </Button>
  );
}
