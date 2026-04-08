'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarContent } from './sidebar';

function usePageTitle() {
  const pathname = usePathname();
  if (pathname === '/') return 'Upcoming';
  if (pathname === '/completed') return 'Completed';
  if (pathname.startsWith('/project/')) return 'Project';
  return 'SlashTask';
}

export function MobileHeader() {
  const title = usePageTitle();

  return (
    <header className="border-border bg-background flex h-12 items-center gap-3 border-b px-4 md:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold">{title}</span>
    </header>
  );
}
