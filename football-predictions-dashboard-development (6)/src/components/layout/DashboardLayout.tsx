import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge } from '../ui';
import {
  LayoutDashboard,
  Target,
  Crown,
  LogOut,
  Trophy,
  Menu,
  X,
  History,
  User,
  Info,
  Mail,
  Shield,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predictions', label: 'All Predictions', icon: Target },
  { id: 'results', label: 'Results & Slides', icon: History },
  { id: 'premium', label: 'Premium Access', icon: Crown, isPremiumCta: true },
];

const accountNavItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
];

const infoNavItems = [
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'webhook', label: 'Webhook Simulator', icon: CreditCard },
  { id: 'sitemap', label: 'Site Map', icon: Shield },
];

export function DashboardLayout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleNav = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const NavItem = ({ item }: { item: { id: string; label: string; icon: React.ElementType; isPremiumCta?: boolean } }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const isPremiumCta = item.isPremiumCta && user?.plan !== 'premium';

    return (
      <button
        onClick={() => handleNav(item.id)}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50',
          isPremiumCta && 'text-amber-600 dark:text-amber-500'
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {isPremiumCta && <Badge variant="premium">PRO</Badge>}
        {isActive && !isPremiumCta && <ChevronRight className="w-4 h-4 opacity-50" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Trophy className="w-6 h-6" />
            <span>FootyPredict</span>
          </button>
          <button className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">Main</p>
            <div className="space-y-0.5">
              {mainNavItems.map(item => <NavItem key={item.id} item={item} />)}

            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">Account</p>
            <div className="space-y-0.5">
              {accountNavItems.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>

          {/* Info / Pages */}
          <div>
            <button
              onClick={() => setInfoOpen(o => !o)}
              className="w-full flex items-center gap-2 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span>Info & Legal</span>
              <ChevronDown className={clsx('w-3 h-3 ml-auto transition-transform', infoOpen && 'rotate-180')} />
            </button>
            {infoOpen && (
              <div className="space-y-0.5">
                {infoNavItems.map(item => <NavItem key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => handleNav('profile')}
            className="flex items-center gap-3 mb-3 px-2 py-2 w-full rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {user?.plan === 'premium' ? '⭐ Premium Member' : 'Free Tier'}
              </p>
            </div>
          </button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:hidden shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Trophy className="w-5 h-5" />
            FootyPredict
          </div>
          <button onClick={() => handleNav('profile')} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
