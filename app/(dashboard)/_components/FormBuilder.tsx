'use client';

import PreviewDialogBtn from '@/app/(dashboard)/_components/PreviewDialogBtn';
import SaveFormBtn from '@/app/(dashboard)/_components/SaveFormBtn';
import { Form } from '@prisma/client';
import React, { useEffect } from 'react';
import PublishFormBtn from './PublishFormBtn';
import Designer from '@/app/(dashboard)/_components/Designer';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import DragOverlayWrapper from './DragOverlayWrapper';
import { useDesginerStore } from '@/store/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { buildFormSubmitUrl } from '@/lib/url';
import FormAccessSettings from './FormAccessSettings';
import FormShareDialog from './FormShareDialog';

type AccessOption = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

type EmployeeOption = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  department?: { name: string | null } | null;
  branch?: { name: string | null } | null;
};

type FormBuilderProps = {
  form: any;
  departments: AccessOption[];
  branches: AccessOption[];
  employees: EmployeeOption[];
};

export default function FormBuilder({ form, departments, branches, employees }: FormBuilderProps) {
  const { setElements } = useDesginerStore();
  const { innerWidth, innerHeight } = typeof window !== 'undefined' ? window : { innerWidth: 0, innerHeight: 0 };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    const elements = JSON.parse(form.content);
    setElements(elements);
  }, [form, setElements]);

  const shareUrl = buildFormSubmitUrl(form.shareUrl, 'link');

  if (form.published) {
    return (
      <>
        <Confetti width={innerWidth} height={innerHeight} recycle={false} numberOfPieces={1000} />
        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
          <h2 className="mb-10 border-b pb-2 text-center text-4xl font-bold uppercase">
            {form.name} is Published
          </h2>
          <div className="max-w-md">
            <p className="text-center text-sm">
              You can share this form with your audience and collect responses.
              <br />
              Share this form to your audience by sending the link below.
            </p>
            <div className="my-4 flex w-full flex-col items-center gap-2 border-b pb-4">
              <Input
                readOnly
                value={shareUrl}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({
                    title: 'Copied',
                    description: 'Copied to clipboard.',
                  });
                }}
                className="w-full text-zinc-50"
                size={'sm'}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="mb-4 flex justify-center">
              <FormAccessSettings
                form={form}
                departments={departments}
                branches={branches}
                employees={employees}
              />
            </div>
            <div className="flex justify-between">
              <Button
                asChild
                variant={'link'}>
                <Link href={'/dashboard'}>Go back to dashboard</Link>
              </Button>
              <Button
                asChild
                variant={'link'}>
                <Link href={`/forms/${form.id}`}>Form Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <DndContext sensors={sensors}>
      <main className="flex w-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b-2 p-4 text-xl">
          <h2 className="truncate font-semibold">
            <span className="mr-2 text-muted-foreground">Form :</span>
            {form.name}
          </h2>
          <div className="flex items-center gap-2">
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
              trigger={<Button variant="secondary">Share</Button>}
            />
            <FormAccessSettings
              form={form}
              departments={departments}
              branches={branches}
              employees={employees}
            />
            {/* PreviewDialogBtn */}
            <PreviewDialogBtn />
            {!form.published && (
              <>
                <SaveFormBtn id={form.id} />
                <PublishFormBtn id={form.id} />
              </>
            )}
          </div>
        </div>
        <div className="relative flex h-[200px] w-full grow items-center justify-center overflow-hidden bg-[#f0ebf8] dark:bg-[#121016] google-form-container">
          <Designer formId={form.id} initialContent={form.content} />
        </div>
      </main>
      {/* Overlay */}
      <DragOverlayWrapper />
    </DndContext>
  );
}
