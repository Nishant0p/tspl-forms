import FormElementsSidebar from './FormElementsSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DesignerSidebar() {
  return (
    <aside className="flex h-auto md:h-full w-full md:w-[400px] lg:w-[440px] max-w-full md:max-w-[440px] shrink-0 flex-col gap-2 overflow-y-auto border-t-2 md:border-t-0 md:border-l-2 border-border bg-background p-3 sm:p-4">
      <ScrollArea className="h-full w-full">
        <FormElementsSidebar />
      </ScrollArea>
    </aside>
  );
}
