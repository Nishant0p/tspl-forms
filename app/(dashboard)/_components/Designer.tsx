'use client';

import { cn, idGenerator } from '@/lib/utils';
import { UpdateFormContent } from '@/app/actions/form';
import { useDesginerStore } from '@/store/store';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import DesginerElementWrapper from './DesginerElementWrapper';
import DesignerSidebar from './DesignerSidebar';
import { ElementsType, FormElements } from './FormElements';
import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Designer({ formId, initialContent }: { formId: number; initialContent: string }) {
  const { elements, addElement, selectedElement, setSelectedElement, removeElement } =
    useDesginerStore();
  const lastSavedRef = useRef(initialContent);
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  const droppable = useDroppable({
    id: 'designer-drop-area',
    data: {
      isDesignerDropArea: true,
    },
  });

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea;

      const droppingSidebarBtnOverDesignerDropArea =
        isDesignerBtnElement && isDroppingOverDesignerDropArea;

      // If we're dropping a sidebar button over the designer drop area
      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );

        addElement(elements.length, newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf =
        over.data?.current?.isTopHalfDesignerElement;

      const isDroppingOverDesignerElementBottomHalf =
        over.data?.current?.isBottomHalfDesignerElement;

      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf;

      const droppingSidebarBtnOverDesignerElement =
        isDesignerBtnElement && isDroppingOverDesignerElement;

      // If we're dropping a sidebar button over a designer element
      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );

        const overId = over.data?.current?.elementId;

        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) {
          throw new Error('Could not find element index');
        }

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      // If we're dragging designer element over another designer element

      const isDraggingDesginerElement = active.data?.current?.isDesignerElement;

      const draggingDesignerElementOverDesignerElement =
        isDroppingOverDesignerElement && isDraggingDesginerElement;

      if (draggingDesignerElementOverDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        );
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error('Could not find element index');
        }

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, activeElement);
      }
    },
  });

  useEffect(() => {
    const serializedElements = JSON.stringify(elements);

    if (!serializedElements || serializedElements === lastSavedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await UpdateFormContent(formId, serializedElements);
        lastSavedRef.current = serializedElements;
      } catch {
        // Keep the canvas usable even if autosave fails.
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [elements, formId]);

  return (
    <div className="relative flex h-full w-full overflow-y-auto md:overflow-hidden flex-col md:flex-row">
      {/* Floating Zoom Controls Widget */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1 shadow-lg backdrop-blur-md transition-all">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom Out (min 50%)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleResetZoom}
                className="min-w-[42px] px-2 py-1 text-xs font-semibold text-foreground hover:text-primary transition-colors rounded hover:bg-accent"
              >
                {zoom}%
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reset Zoom (100%)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom In (max 150%)</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-4 w-[1px] bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleResetZoom}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reset Zoom</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Designer Canvas Container */}
      <div
        ref={droppable.setNodeRef}
        className={cn(
          'w-full h-full p-4 sm:p-8 overflow-auto flex flex-col items-center justify-start transition-colors',
          droppable.isOver && 'bg-violet-500/5 ring-2 ring-violet-500 ring-inset'
        )}
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}>
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-[760px] flex flex-col items-center justify-start overflow-visible transition-all"
        >
          {!droppable.isOver && elements.length === 0 && (
            <p className="flex grow items-center text-3xl font-bold text-muted-foreground py-20">
              Drop here
            </p>
          )}
          {droppable.isOver && elements.length === 0 && (
            <div className="w-full p-4 sm:p-6">
              <div className="h-[120px] rounded-md bg-primary/20"></div>
            </div>
          )}
          {elements.length > 0 && (
            <div className="flex w-full flex-col gap-3 p-4 sm:p-6">
              {elements.map((element) => (
                <DesginerElementWrapper
                  key={element.id}
                  element={element}
                  formId={formId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  );
}
