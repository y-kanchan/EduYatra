import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  FileText,
  PenTool,
  Settings,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AppSidebarProps {
  role?: "student" | "teacher"; // Make role optional to allow URL-based determination
  inSheet?: boolean; // Whether the sidebar is inside a Sheet component
}

export function AppSidebar({ role: propRole, inSheet = false }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [isHovered, setIsHovered] = useState(false);
  const showExpanded = inSheet ? true : (!isCollapsed || isHovered); // Always expanded in Sheet

  // Determine role based on URL if propRole is not provided
  const role = propRole || (location.pathname.startsWith("/student") ? "student" : "teacher");

  const isActive = (href: string) => location.pathname === href;

  const studentMenu = [
    {
      title: "Learn by Topic",
      icon: BookOpen,
      href: "/student/learn",
    },
    {
      title: "Practice Exams",
      icon: FileText,
      href: "/student/practice",
    },
    {
      title: "My Performance",
      icon: BarChart3,
      href: "/student/performance",
    },
    {
      title: "Enrollment",
      icon: Users,
      href: "/student/enrollment",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/student/Settings",
    },
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
    <div
      className="relative h-full"
      onMouseEnter={() => !inSheet && setIsHovered(true)}
      onMouseLeave={() => !inSheet && setIsHovered(false)}
    >
      <Sidebar
        collapsible="icon"
        className={`transition-all duration-300 ease-in-out border-r-2 border-primary/10 ${
          inSheet ? "w-full h-full" : isCollapsed && !isHovered ? "w-16" : "w-64"
        } ${!inSheet ? "md:fixed left-0 top-0 h-full z-40" : ""}`}
      >
        <SidebarHeader className="border-b border-primary/10 p-4">
          <Link 
            to={role === "student" ? "/student" : "/teacher"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src="/logo.svg" 
              alt="Deskoros Logo" 
              className="h-9 w-9 object-contain"
            />
            {showExpanded && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Deskoros
                </h2>
                <p className="text-xs text-muted-foreground">
                  {role === "student" ? "Student Portal" : "Learning Platform"}
                </p>
              </div>
            )}
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          {role === "student" ? (
            <SidebarGroup>
              {showExpanded && (
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-primary font-semibold px-2 mb-2">
                  Student Dashboard
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {studentMenu.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="group hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                        tooltip={!showExpanded ? item.title : undefined}
                      >
                        <Link to={item.href}>
                          <item.icon className="h-5 w-5" />
                          {showExpanded && (
                            <span className="animate-fade-in">{item.title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            teacherMenu.map((section) => (
              <SidebarGroup key={section.title}>
                {showExpanded && (
                  <SidebarGroupLabel className="text-xs uppercase tracking-wider text-primary font-semibold px-2 mb-2">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="group hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                            tooltip={!showExpanded ? section.title : undefined}
                          >
                            <section.icon className="h-5 w-5" />
                            {showExpanded && (
                              <>
                                <span className="animate-fade-in">{section.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {showExpanded && (
                          <CollapsibleContent>
                            <SidebarMenuSub className="animate-slide-in ml-4 border-l-2 border-primary/20 pl-4">
                              {section.items.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={`hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-md ${
                                      isActive(item.href || "") ? "bg-primary/10 text-primary font-medium" : ""
                                    }`}
                                  >
                                    <Link to={item.href || "#"}>{item.title}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          )}
        </SidebarContent>
      </Sidebar>
    </div>
  );
}