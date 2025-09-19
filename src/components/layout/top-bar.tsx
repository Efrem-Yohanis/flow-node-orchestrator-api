import { Home, Server, AlertTriangle, FileText, Wrench, Moon, Sun, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Streams", url: "/streams", icon: Server },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "DevTool", url: "/devtool", icon: Wrench },
];

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) =>
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium border-b-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-success">
              Safaricom ET Pipeline
            </h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${getNavClasses(item.url)}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side - Theme toggle and User menu */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 text-sm font-medium">
                admin
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}