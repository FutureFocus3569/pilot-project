"use client";

import { Bell, Search, User, Menu, ChevronDown, Settings, LogOut } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const { toggle } = useSidebar();
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER': return 'bg-purple-500';
      case 'ADMIN': return 'bg-blue-500';
      case 'USER': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{user?.role || 'USER'}</span>
                  {/* Demo Role Switcher */}
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`h-8 w-8 ${getRoleColor(user?.role || 'USER')} rounded-full flex items-center justify-center hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all cursor-pointer`}
              >
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </button>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Role Switcher Dropdown (Demo) */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40" ref={menuRef}>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Demo: Switch Role</p>
                  {(['MASTER', 'ADMIN', 'USER'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        console.log('Role button clicked:', role);
                        console.log('Current user before switch:', user);
                        switchRole(role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        user?.role === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${getRoleColor(role)} rounded-full`}></div>
                        <span>{role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
