
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Video,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "user" | "provider";
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // This would call a real logout function in a production app
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="fixed inset-y-0 z-30 hidden w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex md:flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center">
              E
            </span>
            <span className="text-lg font-medium">ExpertMeet</span>
          </Link>
        </div>
        <div className="flex-1 px-4 space-y-1 overflow-auto py-4">
          <NavigationItems userType={userType} />
        </div>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">
                    {userType === "provider" ? "Dr. Jane Smith" : "Alex Johnson"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userType === "provider" ? "Service Provider" : "Client Account"}
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={userType === "provider" ? "/dashboard/provider/profile" : "/dashboard/profile"}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={userType === "provider" ? "/dashboard/provider/settings" : "/dashboard/settings"}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r bg-background p-6 shadow-lg md:hidden transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center">
              E
            </span>
            <span className="text-lg font-medium">ExpertMeet</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-1">
          <NavigationItems userType={userType} mobile />
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {userType === "provider" ? "Dr. Jane Smith" : "Alex Johnson"}
              </div>
              <div className="text-sm text-muted-foreground">
                {userType === "provider" ? "Service Provider" : "Client Account"}
              </div>
            </div>
          </div>
          <div className="grid gap-1">
            <Link
              to={userType === "provider" ? "/dashboard/provider/profile" : "/dashboard/profile"}
              className="flex items-center p-2 text-sm rounded-md hover:bg-accent"
              onClick={() => setIsSidebarOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link
              to={userType === "provider" ? "/dashboard/provider/settings" : "/dashboard/settings"}
              className="flex items-center p-2 text-sm rounded-md hover:bg-accent"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
              className="flex items-center p-2 text-sm rounded-md hover:bg-accent w-full text-left"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-2 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {userType === "provider" ? "Provider Dashboard" : "Client Dashboard"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 md:px-6">
            <ActiveCallIndicator userType={userType} />
            <NotificationsDropdown />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

interface NavigationItemsProps {
  userType: "user" | "provider";
  mobile?: boolean;
}

function NavigationItems({ userType, mobile }: NavigationItemsProps) {
  const location = useLocation();
  
  // Define navigation items for each user type
  const clientNavItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Find Experts",
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/find-experts",
    },
    {
      title: "My Appointments",
      icon: <Calendar className="h-5 w-5" />,
      href: "/dashboard/appointments",
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard/messages",
    },
    {
      title: "Documents",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/documents",
    },
  ];
  
  const providerNavItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard/provider",
    },
    {
      title: "Leads",
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/provider/leads",
    },
    {
      title: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
      href: "/dashboard/provider/appointments",
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard/provider/messages",
    },
    {
      title: "Documents",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/provider/documents",
    },
  ];
  
  const navItems = userType === "provider" ? providerNavItems : clientNavItems;
  
  return (
    <div className={mobile ? "space-y-1" : "space-y-1"}>
      {navItems.map((item) => (
        <NavigationItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          title={item.title}
          isActive={location.pathname === item.href}
        />
      ))}
    </div>
  );
}

interface NavigationItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

function NavigationItem({ href, icon, title, isActive }: NavigationItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}

function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuItem className="cursor-pointer flex flex-col items-start p-3">
            <div className="font-medium">New appointment request</div>
            <div className="text-sm text-muted-foreground">
              Dr. Jane Smith has accepted your appointment request for tomorrow at 2:00 PM.
            </div>
            <div className="text-xs text-muted-foreground mt-1">10 minutes ago</div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer flex flex-col items-start p-3">
            <div className="font-medium">New message</div>
            <div className="text-sm text-muted-foreground">
              You have received a new message from Alex Johnson.
            </div>
            <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer flex flex-col items-start p-3">
            <div className="font-medium">Document shared</div>
            <div className="text-sm text-muted-foreground">
              Dr. Jane Smith has shared a document with you: "Tax Planning Guide.pdf"
            </div>
            <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ActiveCallIndicatorProps {
  userType: "user" | "provider";
}

function ActiveCallIndicator({ userType }: ActiveCallIndicatorProps) {
  const [isInCall, setIsInCall] = useState(false);
  
  const joinDemoCall = () => {
    setIsInCall(true);
    toast.success("Joined video call");
  };
  
  const endDemoCall = () => {
    setIsInCall(false);
    toast.success("Left video call");
  };
  
  if (!isInCall) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <Video className="h-4 w-4" />
            Start Demo Call
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Demo Call</DialogTitle>
            <DialogDescription>
              This will simulate joining a video conference with {userType === "provider" ? "a client" : "a service provider"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="bg-muted rounded-lg p-4 text-sm">
              <p>In a real implementation, this would initiate a WebRTC connection or use a third-party video conferencing API.</p>
            </div>
            <Button onClick={joinDemoCall}>
              Join Demo Call
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Button
      variant="destructive"
      size="sm"
      className="hidden sm:flex items-center gap-2 animate-pulse"
      onClick={endDemoCall}
    >
      <Video className="h-4 w-4" />
      End Active Call
    </Button>
  );
}
