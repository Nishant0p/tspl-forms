import React from 'react';
import { FormElement, FormElements } from './FormElements';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { cn, idGenerator } from '@/lib/utils';
import { useDesginerStore } from '@/store/store';
import { toast } from '@/components/ui/use-toast';

export default function SidebarBtnElement({
  formElement,
}: {
  formElement: FormElement;
}) {
  const { label, icon } = formElement.designerBtnElement;
  const { elements, addElement, setSelectedElement } = useDesginerStore();

  const draggable = useDraggable({
    id: `designer-btn-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerBtnElement: true,
    },
  });

  const handleClick = () => {
    const newElement = FormElements[formElement.type].construct(idGenerator());
    addElement(elements.length, newElement);
    setSelectedElement(newElement);
    toast({
      title: `${label} added`,
      description: 'Field added to form. Scroll down or edit in place.',
    });
  };

  return (
    <Button
      ref={draggable.setNodeRef}
      variant={'outline'}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 cursor-pointer h-[72px] w-full p-1.5 text-center hover:bg-accent hover:border-primary/50 transition-all shadow-xs [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0',
        draggable.isDragging && 'ring-2 ring-primary opacity-50'
      )}
      {...draggable.attributes}
      {...draggable.listeners}>
      {icon}
      <p className="text-[11px] font-medium leading-tight text-foreground/80 line-clamp-2">{label}</p>
    </Button>
  );
}

export function SidebarBtnElementOverlay({
  formElement,
}: {
  formElement: FormElement;
}) {
  const { label, icon } = formElement.designerBtnElement;

  return (
    <Button
      variant={'outline'}
      className="flex h-[72px] w-[110px] cursor-grab flex-col items-center justify-center gap-1.5 p-1.5 text-center shadow-lg border-primary ring-2 ring-primary [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 bg-background">
      {icon}
      <p className="text-[11px] font-medium leading-tight text-foreground line-clamp-2">{label}</p>
    </Button>
  );
}
