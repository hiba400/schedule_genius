import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, DoorOpen, GraduationCap, Zap, Calendar, ArrowRight } from 'lucide-react';

interface Stats {
  modules: number;
  professors: number;
  rooms: number;
  groups: number;
}

export default function Dashboard() {
  const { t, isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({ modules: 0, professors: 0, rooms: 0, groups: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [modulesRes, professorsRes, roomsRes, groupsRes] = await Promise.all([
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('professors').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        modules: modulesRes.count || 0,
        professors: professorsRes.count || 0,
        rooms: roomsRes.count || 0,
        groups: groupsRes.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { key: 'modules', icon: BookOpen, value: stats.modules, href: '/modules', color: 'text-blue-500' },
    { key: 'professors', icon: Users, value: stats.professors, href: '/professors', color: 'text-green-500' },
    { key: 'rooms', icon: DoorOpen, value: stats.rooms, href: '/rooms', color: 'text-orange-500' },
    { key: 'groups', icon: GraduationCap, value: stats.groups, href: '/programs', color: 'text-purple-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.welcome}, {user?.email}
          </p>
        </div>

        {isAdmin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const label = t.dashboard.stats[stat.key as keyof typeof t.dashboard.stats];

                return (
                  <Link key={stat.key} to={stat.href}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {label}
                        </CardTitle>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {loading ? '...' : stat.value}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/generate">
                    <Button className="w-full justify-between" size="lg">
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        {t.nav.generate}
                      </span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  </Link>
                  <Link to="/timetables">
                    <Button variant="outline" className="w-full justify-between" size="lg">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {t.nav.timetables}
                      </span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.dashboard.recentGenerations}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    {t.dashboard.noGenerations}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>{t.student.welcome}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/timetables">
                <Button className="w-full" size="lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  {t.student.viewTimetable}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
