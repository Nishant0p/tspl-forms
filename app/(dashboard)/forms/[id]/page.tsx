import { GetFormById, GetFormSubmissions } from '@/app/actions/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, formatDistance } from 'date-fns';
import {
  EyeIcon,
  LogOut,
  MousePointerClick,
  StickyNoteIcon,
  Star,
} from 'lucide-react';
import { ReactNode } from 'react';
import CardStat from '../../_components/CardStat';
import { ElementsType, FormElementInstance } from '../../_components/FormElements';
import FormLinkShare from '../../_components/FormLinkShare';
import FormShareDialog from '../../_components/FormShareDialog';
import VisitBtn from '../../_components/VisitBtn';
import ExportXlsxBtn from '../../_components/ExportXlsxBtn';
import { buildFormSubmitUrl } from '@/lib/url';
import { headers } from 'next/headers';

import FormViewerManager from '../../_components/FormViewerManager';
import { getCurrentEmployee } from '@/lib/auth';

export default async function FormDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const form = await GetFormById(Number(id));
  const currentEmployee = await getCurrentEmployee();
  const isManagerOrAdmin = currentEmployee && ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'HR'].includes(currentEmployee.role);

  const headerList = headers()

  const host = headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';

  if (!form) {
    throw new Error('Form not found');
  }

  const { visits, submissions } = form;

  let submissionsRate = 0;

  if (visits > 0) {
    submissionsRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionsRate;

  const shareLink = buildFormSubmitUrl(form.shareUrl, 'link');

  return (
    <>
      <div className="py-1">
        <div className="container flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="truncate text-4xl font-bold">{form.name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {form.status || (form.published ? 'PUBLISHED' : 'DRAFT')}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                {form.accessMode || 'PUBLIC'}
              </span>
              {form.oneResponsePerUser && (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                  One response per employee
                </span>
              )}
            </div>
          </div>
          <VisitBtn shareUrl={shareLink} />
        </div>
        <div className="border-b border-muted py-4">
          <div className="container flex flex-wrap items-center justify-between gap-2">
            <FormLinkShare shareUrl={shareLink} />
            <div className="flex items-center gap-2">
              {isManagerOrAdmin && (
                <FormViewerManager formId={form.id} formName={form.name} />
              )}
              <FormShareDialog
                form={{
                  shareUrl: form.shareUrl,
                  accessMode: form.accessMode,
                  status: form.status,
                  published: form.published,
                  startDate: form.startDate,
                  endDate: form.endDate,
                  responseLimit: form.responseLimit,
                  name: form.name,
                }}
                trigger={<button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Share</button>}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container w-full grid-cols-1 items-center gap-6 space-y-6 pt-8 md:grid md:grid-cols-2 md:space-y-0 lg:grid-cols-4">
        <CardStat
          title="Total Visits"
          icon={<EyeIcon className="h-6 w-6" />}
          text="Total visits for all your forms"
          value={visits.toLocaleString() ?? '0'}
          loading={false}
          className="shadow-sky-500 drop-shadow-md"
        />
        <CardStat
          title="Total Submissions"
          icon={<StickyNoteIcon className="h-6 w-6" />}
          text="All time form submissions"
          value={submissions.toLocaleString() ?? '0'}
          loading={false}
          className="shadow-amber-500 drop-shadow-md"
        />
        <CardStat
          title="Submissions Rate"
          icon={<MousePointerClick className="h-6 w-6" />}
          text="Visits that resulted in a submissions"
          value={`${submissionsRate.toLocaleString()}%`}
          loading={false}
          className="shadow-green-500 drop-shadow-md"
        />
        <CardStat
          title="Bounce Rate"
          icon={<LogOut className="h-6 w-6" />}
          text="Visits that leave without submitting"
          value={`${bounceRate.toLocaleString()}%`}
          loading={false}
          className="shadow-rose-500 drop-shadow-md"
        />
      </div>
      <div className="container pt-10">
        {/* Ini table submission */}
        <SubMissionTable id={form.id} />
      </div>
    </>
  );
}

type Row = { [key: string]: string } & {
  submitted: string;
  respondent: string;
}

async function SubMissionTable({ id }: { id: number }) {
  const form = await GetFormSubmissions(Number(id));

  if (!form) {
    throw new Error('Form not found');
  }

  const formElements = JSON.parse(form.content) as FormElementInstance[];

  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
      case "TextField":
      case "EmailField":
      case "PhoneField":
      case "NumberField":
      case "TextAreaField":
      case "DateField":
      case "TimeField":
      case "SelectField":
      case "RadioField":
      case "CheckboxField":
      case "RatingField":
      case "LinearScaleField":
      case "FileUploadField":
      case "SignatureField":
      case "ImageField":
      case "VideoField":
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label,
          required: element.extraAttributes?.required,
          type: element.type,
        })
        break;
      default:
        break;
    }
  })

  const rows: Row[] = []
  form.FormSubmissions.forEach((submission: any) => {
    const content = JSON.parse(submission.content);

    const respondent = submission.employee
      ? `${submission.employee.firstName} ${submission.employee.lastName}`
      : 'Anonymous';

    rows.push({
      ...content,
      submitted: submission.submittedAt || submission.createdAt,
      respondent,
    })
  })

  return (
    <>
      <div className="my-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Table Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Total responses: {rows.length}
          </p>
        </div>
        <ExportXlsxBtn formTitle={form.name} columns={columns} rows={rows} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='uppercase'>Submitted by</TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className='uppercase'
              >
                {column.label}
              </TableHead>
            ))}
            <TableHead className='text-right uppercase text-muted-foreground'>
              Submitted at
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className='font-medium'>{row.respondent}</TableCell>
              {columns.map((column) => (
                <RowCell
                  key={column.id}
                  type={column.type}
                  value={row[column.id]}
                />
              ))}
              <TableCell className='text-right text-muted-foreground'>
                {
                  formatDistance(new Date(row.submitted), new Date(), {
                    addSuffix: true
                  })
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function RowCell({ type, value }: { type: ElementsType, value: string }) {
  let node: ReactNode = value

  switch (type) {
    case "DateField":
      if (!value) break;
      const date = new Date(value)
      node = <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">{format(date, 'dd/MM/yyyy')}</span>
      break;
    case "TimeField":
      node = <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">{value}</span>
      break;
    case "RatingField":
      node = <span className='inline-flex items-center gap-1'><Star className='h-4 w-4 text-amber-500' />{value}</span>
      break;
    case "LinearScaleField":
      node = <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">{value}</span>
      break;
    case "CheckboxField":
      const checked = value === 'true';
      node = <Checkbox checked={checked} disabled />
      break;
    case "FileUploadField":
    case "ImageField":
    case "VideoField":
    case "SignatureField":
      try {
        const parsed = JSON.parse(value) as { name?: string; dataUrl?: string };
        if (parsed?.dataUrl) {
          if (type === 'VideoField') {
            node = <video controls className='max-h-24 max-w-48 rounded-md' src={parsed.dataUrl} />;
          } else if (type === 'ImageField' || type === 'SignatureField') {
            node = <img alt={parsed.name || 'Uploaded file'} className='max-h-24 max-w-48 rounded-md object-contain' src={parsed.dataUrl} />;
          } else {
            node = <a className='text-primary underline' href={parsed.dataUrl} target='_blank' rel='noreferrer'>{parsed.name || 'View file'}</a>;
          }
        } else {
          node = <span className='text-sm text-muted-foreground'>{parsed?.name || value}</span>;
        }
      } catch {
        if (type === 'SignatureField' && value.startsWith('data:image')) {
          node = <img alt="Signature" className='max-h-24 max-w-48 rounded-md object-contain' src={value} />;
          break;
        }
        node = <span className='text-sm text-muted-foreground'>{value}</span>;
      }
      break;
  }

  return <TableCell>{node}</TableCell>
}