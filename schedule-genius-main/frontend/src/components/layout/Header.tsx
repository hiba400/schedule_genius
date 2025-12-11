import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, role } = useAuth();
  const { isRTL } = useLanguage();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30',
        isRTL ? 'left-0 right-64' : 'left-64 right-0'
      )}
    >
      <div />
      <div className="flex items-center gap-4">
        <LanguageSelector />
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
              {role === 'admin' ? 'Admin' : 'Étudiant'}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
