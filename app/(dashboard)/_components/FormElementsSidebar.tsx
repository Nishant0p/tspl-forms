'use client';

import React, { useState } from 'react';
import SidebarBtnElement from './SidebarBtnElement';
import { FormElements } from './FormElements';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LayoutGrid, FormInput, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FormElementsSidebar() {
  const [openAccordion, setOpenAccordion] = useState<string[]>(['layout', 'form']);

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
    <div className="w-full space-y-3 pt-1">
      {/* Accordion Drop Boxes for Layout & Form Elements */}
      <Accordion
        type="multiple"
        value={openAccordion}
        onValueChange={setOpenAccordion}
        className="w-full space-y-2.5"
      >
        <AccordionItem value="layout" className="border rounded-md px-3 py-0.5 bg-card shadow-xs">
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2 text-foreground">
              <LayoutGrid className="h-4 w-4 text-blue-500" />
              <span>Layout Elements</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {layoutElements.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <div className="grid grid-cols-4 gap-2">
              {layoutElements.map((element) => (
                <SidebarBtnElement key={element.type} formElement={element} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="form" className="border rounded-md px-3 py-0.5 bg-card shadow-xs">
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2 text-foreground">
              <FormInput className="h-4 w-4 text-emerald-500" />
              <span>Form Elements</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {formElements.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <div className="grid grid-cols-4 gap-2">
              {formElements.map((element) => (
                <SidebarBtnElement key={element.type} formElement={element} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
