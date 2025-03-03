
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Calendar, 
  FileText, 
  Menu,
  X
} from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userType, setUserType] = React.useState<"user" | "provider" | null>(null);

  // For demo purposes we're using state, in a real app this would come from auth
  React.useEffect(() => {
    // Check if user is logged in based on path
    if (location.pathname.includes("/dashboard")) {
      setIsLoggedIn(true);
      if (location.pathname.includes("/provider")) {
        setUserType("provider");
      } else {
        setUserType("user");
      }
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <Link to="/" className="mr-8 flex items-center space-x-2">
          <span className="relative z-20 flex items-center text-lg font-medium">
            <span className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center mr-2">
              E
            </span>
            <span className="hidden sm:inline-block">ExpertMeet</span>
          </span>
        </Link>
        <div className="hidden md:flex flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] grid-cols-2">
                    {serviceCategories.map((category) => (
                      <li key={category.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={category.href}
                            className="flex h-full w-full select-none flex-col justify-between rounded-md p-6 no-underline outline-none focus:shadow-md hover:bg-accent transition-colors duration-200"
                          >
                            <div className="mb-2 text-lg font-medium">
                              {category.title}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {category.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/how-it-works" className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  How It Works
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/pricing" className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  Pricing
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {isLoggedIn ? (
            <>
              {userType === "provider" && (
                <Chip variant="subtle" className="mr-2">Provider</Chip>
              )}
              <Link to={userType === "provider" ? "/dashboard/provider/messages" : "/dashboard/messages"}>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={userType === "provider" ? "/dashboard/provider/appointments" : "/dashboard/appointments"}>
                <Button variant="ghost" size="icon">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={userType === "provider" ? "/dashboard/provider/documents" : "/dashboard/documents"}>
                <Button variant="ghost" size="icon">
                  <FileText className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={userType === "provider" ? "/dashboard/provider" : "/dashboard"}>
                <Avatar className="h-8 w-8 bg-primary/10 hover:bg-primary/20 transition-all">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden ml-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-background border-b shadow-lg animate-fade-in">
          <div className="p-4 space-y-4">
            <div className="grid gap-2">
              <Link 
                to="/services/legal" 
                className="flex items-center p-3 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Legal Services
              </Link>
              <Link 
                to="/services/accounting" 
                className="flex items-center p-3 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accounting Services
              </Link>
              <Link 
                to="/how-it-works" 
                className="flex items-center p-3 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                to="/pricing" 
                className="flex items-center p-3 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
            
            <div className="pt-2 border-t">
              {isLoggedIn ? (
                <div className="grid grid-cols-4 gap-2">
                  <Link 
                    to={userType === "provider" ? "/dashboard/provider/messages" : "/dashboard/messages"}
                    className="flex flex-col items-center p-3 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 mb-1" />
                    <span className="text-xs">Messages</span>
                  </Link>
                  <Link 
                    to={userType === "provider" ? "/dashboard/provider/appointments" : "/dashboard/appointments"}
                    className="flex flex-col items-center p-3 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5 mb-1" />
                    <span className="text-xs">Calendar</span>
                  </Link>
                  <Link 
                    to={userType === "provider" ? "/dashboard/provider/documents" : "/dashboard/documents"}
                    className="flex flex-col items-center p-3 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-5 w-5 mb-1" />
                    <span className="text-xs">Documents</span>
                  </Link>
                  <Link 
                    to={userType === "provider" ? "/dashboard/provider" : "/dashboard"}
                    className="flex flex-col items-center p-3 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1">Profile</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const serviceCategories = [
  {
    title: "Legal Services",
    description: "Connect with attorneys specializing in various areas of law including corporate, family, real estate, and intellectual property.",
    href: "/services/legal",
  },
  {
    title: "Accounting & Tax",
    description: "Find certified accountants and tax professionals to help with personal finances, business accounting, and tax preparation.",
    href: "/services/accounting",
  },
  {
    title: "Consulting",
    description: "Access business consultants, management advisors, and strategy experts to help grow and optimize your business.",
    href: "/services/consulting",
  },
  {
    title: "Financial Services",
    description: "Connect with financial advisors, planners, and wealth management professionals to secure your financial future.",
    href: "/services/financial",
  },
];
