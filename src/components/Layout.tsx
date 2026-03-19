import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { Activity, Camera, Map, MessageSquare, Apple, LogOut, Menu, X, TrendingUp, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/camera', label: 'AI Form Check', icon: Camera },
  { path: '/cycles', label: 'Workout Cycles', icon: Calendar },
  { path: '/performance', label: 'Performance Tracker', icon: TrendingUp },
  { path: '/nutrition', label: 'Nutrition', icon: Apple },
  { path: '/chat', label: 'AI Coach', icon: MessageSquare },
  { path: '/profile', label: 'Edit Profile', icon: User },
];

export const Layout = () => {
  const { userProfile, logout } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:static inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col transition-transform lg:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            GymVision Elite
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 mb-4 px-4">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{userProfile?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-800 flex items-center px-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-zinc-400 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg">GymVision Elite</span>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
        <footer className="py-4 text-center text-xs text-zinc-600 border-t border-zinc-800">
          GymVision Elite • Developed by Aditya
        </footer>
      </main>
    </div>
  );
};
