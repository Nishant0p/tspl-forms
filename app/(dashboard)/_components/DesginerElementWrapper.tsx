import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { idGenerator } from '@/lib/utils';
import { useDesginerStore } from '@/store/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Copy, Trash, Check, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { FormElementInstance, FormElements } from './FormElements';
import { toast } from '@/components/ui/use-toast';
import { deleteElementInstance } from '@/app/actions/form';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function DesginerElementWrapper({
  element,
  formId,
}: {
  element: FormElementInstance;
  formId: number;
}) {
  const router = useRouter();
  const [mouseOver, setMouseOver] = useState(false);
  const DesignerElement = FormElements[element.type].designerComponent;
  const PropertiesElement = FormElements[element.type].propertiesComponent;

  const { removeElement, setSelectedElement, selectedElement, elements, addElement, updateElement } =
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
      await deleteElementInstance(formId, element.id);

      toast({
        title: 'Success',
        description: 'Element deleted from database',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong, please try again later',
      });
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
          'relative flex min-h-[120px] h-auto w-full flex-col rounded-xl text-foreground ring-1 ring-inset ring-border/60 hover:cursor-pointer transition-all duration-200 bg-card shadow-xs',
          isSelected &&
            'ring-2 ring-violet-600 dark:ring-violet-400 border-l-4 border-l-violet-600 dark:border-l-violet-400 shadow-lg shadow-violet-500/10 ring-offset-1 ring-offset-background'
        )}
        onMouseOver={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            setSelectedElement(element);
          }
        }}
      >
        <div ref={topHalf.setNodeRef} className="absolute top-0 h-1/2 w-full rounded-t-md z-0" />
        <div ref={bottomHalf.setNodeRef} className="absolute bottom-0 h-1/2 w-full rounded-b-md z-0" />

        {/* Drag Over Indicators */}
        {topHalf.isOver && (
          <div className="absolute top-0 h-[6px] w-full rounded-md rounded-b-none bg-primary z-30" />
        )}
        {bottomHalf.isOver && (
          <div className="absolute bottom-0 h-[6px] w-full rounded-md rounded-t-none bg-primary z-30" />
        )}

        {/* Selected / Editing State: In-place Google Forms Editor */}
        {isSelected ? (
          <div className="w-full p-4 sm:p-5 space-y-4 relative z-10 cursor-default bg-gradient-to-b from-violet-500/5 to-transparent rounded-xl">
            {/* Top Header Badge */}
            <div className="flex items-center justify-between border-b pb-2.5 text-xs">
              <Badge className="bg-violet-600 hover:bg-violet-700 text-white font-bold gap-1 text-[11px] px-2.5 py-0.5">
                <Sparkles className="h-3 w-3" /> {element.type}
              </Badge>
              <span className="text-[11px] text-muted-foreground font-medium">Editing Field</span>
            </div>

            {/* In-Place Editable Properties Form */}
            <div className="pt-1">
              <PropertiesElement elementInstance={element} />
            </div>

            {/* Footer Toolbar: Requirement Switch + Duplicate + Delete + Done in SAME line */}
            <div className="flex items-center justify-between border-t pt-3.5 mt-2 text-xs gap-3 flex-wrap sm:flex-nowrap">
              {typeof element.extraAttributes?.required === 'boolean' ? (
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Switch
                    id={`req-toggle-${element.id}`}
                    checked={!!element.extraAttributes?.required}
                    onCheckedChange={(checked) => {
                      const updated = {
                        ...element,
                        extraAttributes: {
                          ...element.extraAttributes,
                          required: checked,
                        },
                      };
                      updateElement(element.id, updated);
                      setSelectedElement(updated);
                    }}
                  />
                  <Label
                    htmlFor={`req-toggle-${element.id}`}
                    className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground select-none"
                  >
                    Required
                  </Label>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-1.5 font-semibold text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateElement();
                  }}
                  title="Duplicate field"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-1.5 font-semibold text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                    removeElementFromDatabase();
                  }}
                  title="Delete field"
                >
                  <Trash className="h-3.5 w-3.5" /> Delete
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 text-xs gap-1.5 font-bold bg-violet-600 hover:bg-violet-700 text-white ml-1 shadow-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(null);
                  }}
                >
                  <Check className="h-3.5 w-3.5" /> Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Preview State when not selected */
          <>
            {mouseOver && (
              <>
                <div className="absolute left-0 z-10 h-full">
                  <Button
                    className="flex h-full justify-center rounded-l-xl rounded-r-none border bg-background shadow-xs"
                    size={'icon'}
                    variant={'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement();
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute right-0 z-10 h-full">
                  <Button
                    className="flex h-full justify-center rounded-r-xl rounded-l-none border bg-red-500 text-white shadow-xs"
                    size={'icon'}
                    variant={'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(element.id);
                      removeElementFromDatabase();
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 bg-violet-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md animate-bounce flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Click to Edit In-Place
                </div>
              </>
            )}

            <div
              className={cn(
                'pointer-events-none flex min-h-[110px] h-auto w-full items-start justify-center rounded-xl bg-accent/20 p-4 transition-colors',
                mouseOver && 'opacity-30'
              )}
            >
              <DesignerElement elementInstance={element} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
