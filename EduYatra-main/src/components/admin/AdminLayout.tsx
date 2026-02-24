// frontend/src/components/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  FileQuestion,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  LifeBuoy,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current user is super admin
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isSuperAdmin');
    navigate('/login');
  };

  const toggleDropdown = (key: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper function to check if user has permission
  const hasPermission = (permission: string) => {
    // Super admin has all permissions
    if (isSuperAdmin) return true;
    // If no permissions are set (empty array), hide all menu items
    if (!userPermissions || userPermissions.length === 0) return false;
    // Check if permission exists in user's permissions array
    return userPermissions.includes(permission);
  };

  const allMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true, permission: 'dashboard' },
    {
      icon: Users,
      label: 'Users',
      dropdown: 'users',
      permission: 'students',
      children: [
        { path: '/admin/students', label: 'Students', permission: 'students' },
        { path: '/admin/teachers', label: 'Teachers', permission: 'teachers' },
        // Only show Admins section to super admin
        ...(isSuperAdmin ? [{ path: '/admin/admins', label: 'Admins' }] : []),
      ],
    },
    { path: '/admin/classes', icon: School, label: 'Classes', permission: 'classes' },
    { path: '/admin/exams', icon: FileQuestion, label: 'Exams', permission: 'exams' },
    { path: '/admin/question-banks', icon: BookOpen, label: 'Question Banks', permission: 'question-banks' },
    {
      icon: Image,
      label: 'Content',
      dropdown: 'content',
      permission: 'content',
      children: [
        { path: '/admin/sliders', label: 'Sliders' },
        { path: '/admin/posters', label: 'Posters' },
        { path: '/admin/ads', label: 'Advertisements' },
        { path: '/admin/video', label: 'Video' },
      ],
    },
    { path: '/admin/support', icon: LifeBuoy, label: 'Support Tickets', permission: 'support' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions', permission: 'subscriptions' },
    // Only show Institutes to super admin
    ...(isSuperAdmin ? [{ path: '/admin/institutes', icon: Building2, label: 'Institutes' }] : []),
    { path: '/admin/settings', icon: Settings, label: 'Settings', permission: 'settings' },
    { path: '/admin/audit-logs', icon: Shield, label: 'Audit Logs', permission: 'audit-logs' },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => {
    // Items without permission requirement (like Institutes for super admin) are always shown if they're in the array
    if (!item.permission) return true;
    // Check if user has the required permission
    return hasPermission(item.permission);
  }).map(item => {
    // Filter children based on permissions too
    if (item.children) {
      return {
        ...item,
        children: item.children.filter((child: any) => {
          if (!child.permission) return true;
          return hasPermission(child.permission);
        })
      };
    }
    return item;
  });

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarOpen ? 'w-64' : 'lg:w-20 w-64'
        } bg-indigo-900 text-white transition-all duration-300 flex flex-col fixed lg:relative h-full z-50`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && <h1 className="text-lg sm:text-xl font-bold truncate">EduYatra Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-indigo-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.dropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-800 transition-colors ${
                      item.children?.some((child) => isActive(child.path))
                        ? 'bg-indigo-800'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          dropdowns[item.dropdown] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {sidebarOpen && dropdowns[item.dropdown] && (
                    <div className="bg-indigo-950">
                      {item.children?.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={`block px-12 py-2 hover:bg-indigo-800 transition-colors ${
                            isActive(child.path) ? 'bg-indigo-800' : ''
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-indigo-800 transition-colors ${
                    isActive(item.path!, item.exact) ? 'bg-indigo-800' : ''
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 border-t border-indigo-800 hover:bg-indigo-800 transition-colors"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded hover:bg-gray-100 mr-2"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-800 truncate">
              {location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD'}
            </h2>
            {isSuperAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                <Shield size={12} className="mr-1" />
                Super Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <MessageSquare size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                {userProfile.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold truncate max-w-[150px]">{userProfile.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{userProfile.email || 'admin@eduyatra.com'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
