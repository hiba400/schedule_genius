import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  DoorOpen,
  Settings2,
  Zap,
  Calendar,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/' },
  { key: 'modules', icon: BookOpen, href: '/modules' },
  { key: 'professors', icon: Users, href: '/professors' },
  { key: 'programs', icon: GraduationCap, href: '/programs' },
  { key: 'rooms', icon: DoorOpen, href: '/rooms' },
  { key: 'constraints', icon: Settings2, href: '/constraints' },
  { key: 'generate', icon: Zap, href: '/generate' },
  { key: 'timetables', icon: Calendar, href: '/timetables' },
];

const studentNavItems = [
  { key: 'timetables', icon: Calendar, href: '/timetables' },
];

export function Sidebar() {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { isAdmin, signOut } = useAuth();

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40',
        isRTL ? 'right-0 border-l border-r-0' : 'left-0'
      )}
    >
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">{t.app.name}</h1>
        <p className="text-sm text-muted-foreground">{t.app.title}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const label = t.nav[item.key as keyof typeof t.nav];

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          <span>{t.nav.logout}</span>
        </Button>
      </div>
    </aside>
  );
}
