import { useDesginerStore } from '@/store/store';
import FormElementsSidebar from './FormElementsSidebar';
import PropertiesFormSidebar from './PropertiesFormSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DesignerSidebar() {
  const { selectedElement } = useDesginerStore();

  return (
    <aside className="flex h-auto md:h-full w-full md:w-[350px] lg:w-[400px] max-w-full md:max-w-[400px] shrink-0 flex-col gap-2 overflow-y-auto border-t-2 md:border-t-0 md:border-l-2 border-border bg-background p-3 sm:p-4">
      <ScrollArea className="h-full w-full">
        {!selectedElement && <FormElementsSidebar />}
        {selectedElement && <PropertiesFormSidebar />}
      </ScrollArea>
    </aside>
  );
}
