// Layout.tsx
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  BookOpen, Users, BarChart3, FileText, Settings, 
  PenTool, ChevronRight 
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children, isStudent }: { children: React.ReactNode; isStudent: boolean }) {
  const { state } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const studentMenu = [
    { title: "Learn by Topic", icon: BookOpen, href: "/student/learn" },
    { title: "Practice Exams", icon: FileText, href: "/student/practice" },
    { title: "My Performance", icon: BarChart3, href: "/student/performance" },
    { title: "Enrollment", icon: Users, href: "/student/enrollment" },
    { title: "Settings", icon: Settings, href: "/student/Settings" },
  ];

  const teacherMenu = [
    {
      title: "Conduct Test",
      icon: PenTool,
      items: [
        { title: "Online", href: "/conduct-test/online" },
        { title: "Offline", href: "/conduct-test/offline" },
      ],
    },
    {
      title: "Manage Questions",
      icon: BookOpen,
      items: [
        { title: "Create Question", href: "/questions/create" },
        { title: "Review Question Sets", href: "/questions/review" },
      ],
    },
    {
      title: "Manage Students",
      icon: Users,
      items: [
        { title: "Student Batches", href: "/manage-students" },
        { title: "Test/Exam Analysis", href: "/performance/analysis" },
        { title: "Individual Student Analysis", href: "/performance/individual" },
        { title: "Ongoing Test/Exam", href: "/performance/ongoing" },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        { title: "General", href: "/settings/general" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar role={isStudent ? "student" : "teacher"} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-primary/10 p-4 text-left">
            <Link 
              to={isStudent ? "/student" : "/teacher"} 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src="/logo.svg" 
                alt="Deskoros Logo" 
                className="h-9 w-9 object-contain"
              />
              <div>
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Deskoros
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {isStudent ? "Student Portal" : "Learning Platform"}
                </p>
              </div>
            </Link>
          </SheetHeader>
          
          <div className="flex flex-col gap-2 p-4">
            {isStudent ? (
              // Student Menu
              studentMenu.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-primary/5"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))
            ) : (
              // Teacher Menu
              teacherMenu.map((section) => (
                <Collapsible key={section.title} className="space-y-1">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 py-3 h-auto font-normal hover:bg-primary/5"
                    >
                      <section.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{section.title}</span>
                      <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-8 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-primary/5"
                        }`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden md:ml-16">
        <TopNavigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isStudent = location.pathname.startsWith("/student");

  return (
    <SidebarProvider>
      <LayoutContent isStudent={isStudent}>{children}</LayoutContent>
    </SidebarProvider>
  );
}
