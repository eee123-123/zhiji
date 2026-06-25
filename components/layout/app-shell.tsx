import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zhiji-dark">
      <Sidebar />
      <main className="md:ml-16 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
