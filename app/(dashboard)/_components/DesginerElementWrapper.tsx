import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { idGenerator } from '@/lib/utils';
import { useDesginerStore } from '@/store/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Copy, Trash } from 'lucide-react';
import { useState } from 'react';
import { FormElementInstance, FormElements } from './FormElements';
import { toast } from '@/components/ui/use-toast';
import { deleteElementInstance } from '@/app/actions/form';
import { useRouter } from 'next/navigation';

export default
  function DesginerElementWrapper({
    element,
    formId,
  }: {
    element: FormElementInstance;
    formId: number;
  }) {
  const router = useRouter()
  const [mouseOver, setMouseOver] = useState(false);
  const DesignerElement = FormElements[element.type].designerComponent;
  const { removeElement, setSelectedElement, selectedElement, elements, addElement } =
    useDesginerStore();

  const isSelected = selectedElement?.id === element.id;

  const topHalf = useDroppable({
    id: element.id + '-top',
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + '-bottom',
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + '-drag-handle',
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  async function removeElementFromDatabase() {
    try {
      await deleteElementInstance(formId, element.id)

      toast({
        title: "Success",
        description: "Element deleted from database",
      })

      router.refresh()

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong, please try again later",
      })
    }
  }

  function duplicateElement() {
    const currentIndex = elements.findIndex((currentElement) => currentElement.id === element.id);

    if (currentIndex === -1) return;

    const duplicatedElement = JSON.parse(JSON.stringify(element)) as FormElementInstance;
    duplicatedElement.id = idGenerator();

    addElement(currentIndex + 1, duplicatedElement);
    setSelectedElement(duplicatedElement);
  }

  return (
    <>
      <div
        ref={draggable.setNodeRef}
        {...draggable.attributes}
        {...draggable.listeners}
        className={cn(
          "relative flex min-h-[120px] h-auto w-full flex-col rounded-md text-foreground ring-1 ring-inset ring-accent hover:cursor-pointer transition-all duration-200",
          isSelected && "ring-2 ring-violet-600 dark:ring-violet-400 border-violet-600 dark:border-violet-400 shadow-md ring-offset-2 ring-offset-background"
        )}
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(element);
        }}>
        {isSelected && (
          <div className="absolute -top-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-violet-600 text-white text-[11px] font-semibold px-3 py-0.5 shadow-sm border border-violet-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Editing
          </div>
        )}
        <div
          ref={topHalf.setNodeRef}
          className="absolute top-0 h-1/2 w-full rounded-t-md z-0"
        />
        <div
          ref={bottomHalf.setNodeRef}
          className="absolute bottom-0 h-1/2 w-full rounded-b-md z-0"
        />
        {mouseOver && (
          <>
            <div className="absolute left-0 z-10 h-full">
              <Button
                className="flex h-full justify-center rounded-md rounded-r-none border bg-background"
                size={'icon'}
                variant={'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateElement();
                }}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute right-0 z-10 h-full">
              <Button
                className="flex h-full justify-center rounded-md rounded-l-none border bg-red-500 text-white"
                size={'icon'}
                variant={'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(element.id);
                  removeElementFromDatabase();
                }}>
                <Trash className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 bg-background/90 text-foreground px-3 py-1.5 rounded-full border border-border text-xs font-medium shadow-sm animate-pulse">
              <p>Click for properties or drag to move</p>
            </div>
          </>
        )}
        {topHalf.isOver && (
          <div className="absolute top-0 h-[8px] w-full rounded-md rounded-b-none bg-primary z-20" />
        )}
        <div
          className={cn(
            'pointer-events-none flex min-h-[120px] h-auto w-full items-center rounded-md bg-accent/40 p-4 transition-colors',
            isSelected && 'bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/30',
            mouseOver && 'opacity-30'
          )}>
          <DesignerElement elementInstance={element} />
        </div>
        {bottomHalf.isOver && (
          <div className="absolute bottom-0 h-[8px] w-full rounded-md rounded-t-none bg-primary z-20" />
        )}
      </div>
    </>
  );
}
