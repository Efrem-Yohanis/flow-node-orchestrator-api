import { ReactNode, useState } from 'react';
import { ManagerSidebar } from './ManagerSidebar';
import { TopNavbar } from './TopNavbar';
import { Footer } from './Footer';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <div className="flex flex-1">
          {/* Mobile overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Sidebar - hidden on mobile, shown on lg+ */}
          <div className={`
            fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <ManagerSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <TopNavbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 overflow-auto">
              <div className="p-3 sm:p-4 md:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};
