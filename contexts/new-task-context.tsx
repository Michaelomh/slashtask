'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type NewTaskContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const NewTaskContext = createContext<NewTaskContextType>({
  open: false,
  setOpen: () => {},
});

const SHORTCUT_PATHNAMES = ['/', '/upcoming', '/completed'];

function isShortcutPathname(pathname: string) {
  return (
    SHORTCUT_PATHNAMES.includes(pathname) || pathname.startsWith('/project/')
  );
}

export function useNewTask() {
  return useContext(NewTaskContext);
}

export function NewTaskProvider({ children }: React.PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isShortcutPathname(pathname)) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === '`') {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);

  return (
    <NewTaskContext.Provider value={{ open, setOpen }}>
      {children}
    </NewTaskContext.Provider>
  );
}
