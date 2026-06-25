import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zhiji-dark">
      <Sidebar />
      <main className="pb-20 md:pb-0 md:ml-48">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
