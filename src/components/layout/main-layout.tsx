import { TopBar } from "./top-bar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopBar />
      
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}