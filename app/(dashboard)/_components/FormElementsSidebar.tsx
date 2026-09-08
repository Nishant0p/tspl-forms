'use client';

import React, { useState } from 'react';
import SidebarBtnElement from './SidebarBtnElement';
import { FormElements } from './FormElements';
import { LayoutGrid, FormInput, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FormElementsSidebar() {
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(true);

  const layoutElements = [
    FormElements.BannerField,
    FormElements.TitleField,
    FormElements.SubTitleField,
    FormElements.ParagraphField,
    FormElements.SeperatorField,
    FormElements.SpacerField,
    FormElements.SectionHeaderField,
    FormElements.ThankYouField,
  ];

  const formElements = [
    FormElements.TextField,
    FormElements.EmailField,
    FormElements.PhoneField,
    FormElements.NumberField,
    FormElements.TextAreaField,
    FormElements.DateField,
    FormElements.TimeField,
    FormElements.SelectField,
    FormElements.RadioField,
    FormElements.CheckboxField,
    FormElements.RatingField,
    FormElements.LinearScaleField,
    FormElements.FileUploadField,
    FormElements.SignatureField,
    FormElements.ImageField,
    FormElements.VideoField,
  ];

  return (
    <div className="w-full space-y-3 pt-1 pb-4">
      {/* Layout Elements Section */}
      <div className="rounded-xl border border-border/80 bg-card p-2.5 shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setLayoutOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-1 px-1 text-xs font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Layout Elements</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-bold">
              {layoutElements.length}
            </Badge>
          </div>
          {layoutOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
        </button>

        {layoutOpen && (
          <div className="pt-2.5">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {layoutElements.map((element) => (
                <SidebarBtnElement key={element.type} formElement={element} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Elements Section */}
      <div className="rounded-xl border border-border/80 bg-card p-2.5 shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setFormOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-1 px-1 text-xs font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-foreground">
              <FormInput className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-xs text-foreground">Form Elements</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-bold">
              {formElements.length}
            </Badge>
          </div>
          {formOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
        </button>

        {formOpen && (
          <div className="pt-2.5">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {formElements.map((element) => (
                <SidebarBtnElement key={element.type} formElement={element} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
