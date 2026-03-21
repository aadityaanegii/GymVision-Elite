import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { Activity, Camera, Map, MessageSquare, Apple, LogOut, Menu, X, TrendingUp, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

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
  const { user, userProfile, logout } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();
  const [macros, setMacros] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, targetCalories: 0 });

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'nutritionPlans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const plan = snapshot.docs[0].data();
        const today = new Date().toISOString().split('T')[0];
        
        if (plan.lastUpdatedDate === today) {
          const completedMeals = (plan.meals || []).filter((m: any) => m.completed);
          setMacros({
            calories: completedMeals.reduce((acc: number, m: any) => acc + (m.calories || 0), 0),
            protein: completedMeals.reduce((acc: number, m: any) => acc + (m.protein || 0), 0),
            carbs: completedMeals.reduce((acc: number, m: any) => acc + (m.carbs || 0), 0),
            fats: completedMeals.reduce((acc: number, m: any) => acc + (m.fats || 0), 0),
            targetCalories: plan.dailyCalories || 0
          });
        } else {
          setMacros({ calories: 0, protein: 0, carbs: 0, fats: 0, targetCalories: plan.dailyCalories || 0 });
        }
      }
    }, (error) => {
      console.error("Error fetching macros for sidebar:", error);
    });

    return () => unsubscribe();
  }, [user]);

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
        className="fixed lg:static inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-transform lg:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            GymVision Elite
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
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

          {/* Macro Summary in Sidebar */}
          {macros.targetCalories > 0 && (
            <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Today's Macros</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Calories</span>
                    <span className="font-medium text-orange-400">{macros.calories} / {macros.targetCalories}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${Math.min(100, (macros.calories / macros.targetCalories) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="text-center">
                    <p className="text-zinc-500">Pro</p>
                    <p className="font-medium text-red-400">{macros.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500">Carbs</p>
                    <p className="font-medium text-blue-400">{macros.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500">Fats</p>
                    <p className="font-medium text-yellow-400">{macros.fats}g</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
