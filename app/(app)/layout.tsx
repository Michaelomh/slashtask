import { MobileHeader } from '@/components/mobile-header';
import { Sidebar } from '@/components/sidebar';

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {modal}
    </div>
  );
}
