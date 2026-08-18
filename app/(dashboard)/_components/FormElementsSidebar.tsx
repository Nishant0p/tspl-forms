import React from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { FormElements } from './FormElements'
import { Separator } from '@/components/ui/separator'


export default function FormElementsSidebar() {
  return (
    <div>
      <p className='text-sm text-foreground/70'>Drag and Drop Elements</p>
      <Separator className='my-2' />
      <div className='grid grid-cols-1 place-items-center gap-4 md:grid-cols-2 lg:gap-2'>
        <p className='col-span-1 my-2 place-self-start text-sm md:col-span-2'>Layout Elements</p>
        <SidebarBtnElement formElement={FormElements.TitleField} />
        <SidebarBtnElement formElement={FormElements.SubTitleField} />
        <SidebarBtnElement formElement={FormElements.ParagraphField} />
        <SidebarBtnElement formElement={FormElements.SeperatorField} />
        <SidebarBtnElement formElement={FormElements.SpacerField} />
        <SidebarBtnElement formElement={FormElements.SectionHeaderField} />

        <p className='col-span-1 my-2 place-self-start text-sm md:col-span-2'>Form Elements</p>
        <SidebarBtnElement formElement={FormElements.TextField} />
        <SidebarBtnElement formElement={FormElements.EmailField} />
        <SidebarBtnElement formElement={FormElements.PhoneField} />
        <SidebarBtnElement formElement={FormElements.NumberField} />
        <SidebarBtnElement formElement={FormElements.TextAreaField} />
        <SidebarBtnElement formElement={FormElements.DateField} />
        <SidebarBtnElement formElement={FormElements.TimeField} />
        <SidebarBtnElement formElement={FormElements.SelectField} />
        <SidebarBtnElement formElement={FormElements.RadioField} />
        <SidebarBtnElement formElement={FormElements.CheckboxField} />
        <SidebarBtnElement formElement={FormElements.RatingField} />
        <SidebarBtnElement formElement={FormElements.LinearScaleField} />
        <SidebarBtnElement formElement={FormElements.FileUploadField} />
        <SidebarBtnElement formElement={FormElements.SignatureField} />
        <SidebarBtnElement formElement={FormElements.ImageField} />
        <SidebarBtnElement formElement={FormElements.VideoField} />
      </div>
    </div>
  )
}
