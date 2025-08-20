"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Bot,
  Settings,
  LogOut,
  Users,
  Database,
  X,
  Zap,
  DollarSign,
  User,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quick Access",
    href: "/quick-access",
    icon: Zap,
  },
  {
    name: "Budget Management",
    href: "/budget",
    icon: DollarSign,
  },
  {
    name: "Data Management",
    href: "/data-management",
    icon: Database,
  },
  {
    name: "Xero",
    href: "/xero",
    icon: Building2,
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: Megaphone,
  },
  {
    name: "Assistant",
    href: "/assistant",
    icon: Bot,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { user, logout } = useAuth();

  // Close sidebar on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  // Use real user data from auth context
  const currentUser = user || {
    role: 'USER' // Fallback if not authenticated
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    // Budget Management is only visible to MASTER and ADMIN users
    if (item.href === '/budget') {
      return currentUser.role === 'MASTER' || currentUser.role === 'ADMIN';
    }
    // Data Management is only visible to MASTER users
    if (item.href === '/data-management') {
      return currentUser.role === 'MASTER';
    }
    // All other pages are visible to everyone
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button
            onClick={close}
            className="p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-lg hover:bg-white/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 bg-white relative overflow-hidden">
          <Link href="/dashboard" className="flex items-center relative z-10">
            {/* Future Focus Logo - Double size */}
            <div className="w-24 h-24 lg:w-28 lg:h-28 relative transform hover:scale-105 transition-transform duration-300">
              {/* Try to load actual logo first */}
              <Image
                src="/images/logo.png"
                alt="Future Focus Early Learning"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-lg"
                onError={(e) => {
                  // Hide if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Show fallback
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Enhanced gradient fallback with your brand colors */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-teal-50 rounded-xl flex items-center justify-center shadow-lg border border-white/50"
                style={{ display: 'none' }}
              >
                <span className="text-blue-600 font-bold text-2xl tracking-tight">FF</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close} // Close sidebar on mobile after navigation
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-200"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 hover:text-gray-900 hover:shadow-md"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-teal-400/20"></div>
                )}
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 relative z-10",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600",
                  "group-hover:scale-110"
                )} />
                <span className="truncate relative z-10">{item.name}</span>
                {/* Subtle glow effect for active item */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-75 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
          {/* Staff Management - Only for MASTER and ADMIN */}
          {(currentUser.role === 'MASTER' || currentUser.role === 'ADMIN') && (
            <Link
              href="/staff-management"
              className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md mb-2",
                pathname === "/staff-management"
                  ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-teal-100 hover:text-gray-900"
              )}
            >
              <Users className={cn(
                "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200",
                pathname === "/staff-management"
                  ? "text-white"
                  : "text-gray-500 group-hover:text-blue-600 group-hover:scale-110"
              )} />
              <span className="truncate">Staff Management</span>
            </Link>
          )}
          
          <button
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100 hover:text-gray-900 transition-all duration-200 hover:shadow-md"
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
            <span className="truncate">Settings</span>
          </button>
          <button
            onClick={logout}
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 transition-all duration-200 hover:shadow-md mt-2"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-red-600 group-hover:scale-110 transition-all duration-200" />
            <span className="truncate">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}
