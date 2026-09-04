'use client';

import PreviewDialogBtn from '@/app/(dashboard)/_components/PreviewDialogBtn';
import SaveFormBtn from '@/app/(dashboard)/_components/SaveFormBtn';
import { Form } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import PublishFormBtn from './PublishFormBtn';
import DeleteFormBtn from './DeleteFormBtn';
import Designer from '@/app/(dashboard)/_components/Designer';
import FormBuilderSettingsTab from './FormBuilderSettingsTab';
import FormBuilderResponsesTab from './FormBuilderResponsesTab';
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
import { copyToClipboard, cn } from '@/lib/utils';
import {
  Check,
  Copy,
  Eye,
  Globe,
  Save,
  Settings2,
  Share2,
  ArrowLeft,
  Users,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { buildFormSubmitUrl } from '@/lib/url';
import FormAccessSettings from './FormAccessSettings';
import FormShareDialog from './FormShareDialog';
import FormCollaboratorsModal from '@/components/FormCollaboratorsModal';
import EditableFormName from './EditableFormName';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AccessOption = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

type EmployeeOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
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
  const [activeTab, setActiveTab] = useState<'questions' | 'responses' | 'settings'>('questions');
  const [copied, setCopied] = useState(false);

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
    try {
      const elements = JSON.parse(form.content);
      setElements(elements);
    } catch {
      setElements([]);
    }
  }, [form, setElements]);

  const shareUrl = buildFormSubmitUrl(form.shareUrl, 'link');

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy URL automatically.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DndContext sensors={sensors}>
      <main className="flex w-full flex-col min-h-screen bg-background">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 backdrop-blur px-3 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Back to Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2 min-w-0">
              <EditableFormName formId={form.id} initialName={form.name} className="text-base sm:text-lg font-semibold truncate" />
              {form.published ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium shrink-0">
                  <Globe className="h-3 w-3" /> Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium shrink-0">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <TooltipProvider>
              {/* Preview */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <PreviewDialogBtn
                      formName={form.name}
                      formDescription={form.description}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Preview</p>
                </TooltipContent>
              </Tooltip>

              {/* Collaborators & Access */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <FormCollaboratorsModal
                      formId={form.id}
                      formName={form.name}
                      iconOnly
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Collaborators (Editors & Viewers)</p>
                </TooltipContent>
              </Tooltip>

              {/* Share / Send Button (Google Forms style Send button) */}
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
                trigger={
                  <Button size="sm" className="h-8 px-3.5 gap-1.5 bg-[#673ab7] hover:bg-[#5e35b1] text-white font-medium shadow-sm text-xs rounded-md">
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </Button>
                }
              />

              {/* Save Form */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SaveFormBtn id={form.id} iconOnly />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Save Form Changes</p>
                </TooltipContent>
              </Tooltip>

              {/* Publish (if not yet published) */}
              {!form.published && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <PublishFormBtn
                        id={form.id}
                        trigger={
                          <Button size="sm" variant="outline" className="h-8 px-3 gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                            <Globe className="h-3.5 w-3.5" />
                            <span>Publish</span>
                          </Button>
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Publish Form</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DeleteFormBtn formId={form.id} formName={form.name} iconOnly />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete Form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Google Forms 3 Navigation Tabs */}
        <div className="sticky top-[49px] z-20 flex items-center justify-center gap-2 sm:gap-8 border-b bg-background px-4">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={cn(
              'relative pb-2.5 pt-2.5 text-xs sm:text-sm font-medium transition-colors hover:text-foreground cursor-pointer select-none',
              activeTab === 'questions'
                ? 'text-[#673ab7] dark:text-purple-400 font-semibold'
                : 'text-muted-foreground'
            )}
          >
            Questions
            {activeTab === 'questions' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#673ab7] dark:bg-purple-400 rounded-t-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={cn(
              'relative pb-2.5 pt-2.5 text-xs sm:text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 cursor-pointer select-none',
              activeTab === 'responses'
                ? 'text-[#673ab7] dark:text-purple-400 font-semibold'
                : 'text-muted-foreground'
            )}
          >
            Responses
            {form.submissions > 0 && (
              <span className="rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.2 text-[10px] font-bold">
                {form.submissions}
              </span>
            )}
            {activeTab === 'responses' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#673ab7] dark:bg-purple-400 rounded-t-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'relative pb-2.5 pt-2.5 text-xs sm:text-sm font-medium transition-colors hover:text-foreground cursor-pointer select-none',
              activeTab === 'settings'
                ? 'text-[#673ab7] dark:text-purple-400 font-semibold'
                : 'text-muted-foreground'
            )}
          >
            Settings
            {activeTab === 'settings' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#673ab7] dark:bg-purple-400 rounded-t-sm" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'questions' && (
          <div className="relative flex h-[calc(100vh-95px)] min-h-[600px] w-full grow items-center justify-center overflow-hidden bg-[#f0ebf8] dark:bg-[#121016] google-form-container">
            <Designer formId={form.id} initialContent={form.content} />
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="h-[calc(100vh-95px)] overflow-y-auto bg-[#f0ebf8] dark:bg-[#121016] p-4 sm:p-6">
            <FormBuilderResponsesTab formId={form.id} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-[calc(100vh-95px)] overflow-y-auto bg-[#f0ebf8] dark:bg-[#121016] p-4 sm:p-6">
            <FormBuilderSettingsTab
              form={form}
              departments={departments}
              branches={branches}
            />
          </div>
        )}
      </main>
      {/* Overlay */}
      <DragOverlayWrapper />
    </DndContext>
  );
}
