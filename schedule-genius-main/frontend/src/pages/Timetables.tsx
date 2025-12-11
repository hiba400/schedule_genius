import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimetableEntry {
  id: string;
  group_id: string;
  module_id: string;
  professor_id: string | null;
  room_id: string | null;
  day_of_week: number;
  slot_index: number;
  semester: string;
  session_type: string;
  modules?: { name: string; code: string };
  professors?: { name: string };
  rooms?: { name: string };
  groups?: { name: string; programs?: { name: string } };
}

interface Group {
  id: string;
  name: string;
  programs?: { name: string };
}

interface Professor {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

export default function Timetables() {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const [view, setView] = useState<'group' | 'professor' | 'room'>('group');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  const days = [0, 1, 2, 3, 4];
  const slots = [0, 1, 2, 3];

  useEffect(() => {
    async function fetchData() {
      const [groupsRes, professorsRes, roomsRes] = await Promise.all([
        supabase.from('groups').select('*, programs(name)').order('name'),
        supabase.from('professors').select('id, name').order('name'),
        supabase.from('rooms').select('id, name').order('name'),
      ]);

      if (groupsRes.data) setGroups(groupsRes.data);
      if (professorsRes.data) setProfessors(professorsRes.data);
      if (roomsRes.data) setRooms(roomsRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setEntries([]);
      return;
    }

    async function fetchEntries() {
      let query = supabase
        .from('timetable_entries')
        .select('*, modules(name, code), professors(name), rooms(name), groups(name, programs(name))');

      if (view === 'group') {
        query = query.eq('group_id', selectedId);
      } else if (view === 'professor') {
        query = query.eq('professor_id', selectedId);
      } else if (view === 'room') {
        query = query.eq('room_id', selectedId);
      }

      const { data } = await query.order('day_of_week').order('slot_index');
      if (data) {
        setEntries(data);
        detectConflicts(data);
      }
    }

    fetchEntries();
  }, [selectedId, view]);

  const detectConflicts = (entries: TimetableEntry[]) => {
    const conflictSet = new Set<string>();
    const slotMap = new Map<string, TimetableEntry[]>();

    entries.forEach((entry) => {
      const key = `${entry.day_of_week}-${entry.slot_index}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      slotMap.get(key)!.push(entry);
    });

    slotMap.forEach((slotEntries) => {
      if (slotEntries.length > 1) {
        slotEntries.forEach((e) => conflictSet.add(e.id));
      }
    });

    setConflicts(conflictSet);
  };

  const getEntryForSlot = (day: number, slot: number) => {
    return entries.find((e) => e.day_of_week === day && e.slot_index === slot);
  };

  const handleDragStart = (e: React.DragEvent, entry: TimetableEntry) => {
    e.dataTransfer.setData('entryId', entry.id);
  };

  const handleDrop = async (e: React.DragEvent, day: number, slot: number) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData('entryId');

    if (!isAdmin) return;

    const { error } = await supabase
      .from('timetable_entries')
      .update({ day_of_week: day, slot_index: slot })
      .eq('id', entryId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.common.success);
      // Refresh entries
      setSelectedId((prev) => prev);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const exportToPDF = () => {
    toast.info('Export PDF - fonctionnalité à venir');
  };

  const exportToExcel = () => {
    toast.info('Export Excel - fonctionnalité à venir');
  };

  const getSelectOptions = () => {
    switch (view) {
      case 'group':
        return groups.map((g) => ({ id: g.id, label: `${g.programs?.name} - ${g.name}` }));
      case 'professor':
        return professors.map((p) => ({ id: p.id, label: p.name }));
      case 'room':
        return rooms.map((r) => ({ id: r.id, label: r.name }));
      default:
        return [];
    }
  };

  const getSelectLabel = () => {
    switch (view) {
      case 'group':
        return t.timetables.selectGroup;
      case 'professor':
        return t.timetables.selectProfessor;
      case 'room':
        return t.timetables.selectRoom;
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.timetables.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              {t.timetables.exportPDF}
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              {t.timetables.exportExcel}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Tabs value={view} onValueChange={(v) => { setView(v as typeof view); setSelectedId(''); }}>
                <TabsList>
                  <TabsTrigger value="group">{t.timetables.viewByGroup}</TabsTrigger>
                  <TabsTrigger value="professor">{t.timetables.viewByProfessor}</TabsTrigger>
                  <TabsTrigger value="room">{t.timetables.viewByRoom}</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder={getSelectLabel()} />
                </SelectTrigger>
                <SelectContent>
                  {getSelectOptions().map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedId ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">{getSelectLabel()}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-3 border border-border bg-muted w-32" />
                    {days.map((day) => (
                      <th key={day} className="p-3 border border-border bg-muted text-center font-medium">
                        {t.time.days[day.toString() as keyof typeof t.time.days]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot}>
                      <td className="p-3 border border-border bg-muted text-sm font-medium whitespace-nowrap">
                        {t.time.slots[slot.toString() as keyof typeof t.time.slots]}
                      </td>
                      {days.map((day) => {
                        const entry = getEntryForSlot(day, slot);
                        const hasConflict = entry && conflicts.has(entry.id);

                        return (
                          <td
                            key={day}
                            className={cn(
                              'p-2 border border-border h-24 align-top transition-colors',
                              !entry && 'bg-background hover:bg-muted/50',
                              hasConflict && 'bg-red-500/10'
                            )}
                            onDrop={(e) => handleDrop(e, day, slot)}
                            onDragOver={handleDragOver}
                          >
                            {entry && (
                              <div
                                className={cn(
                                  'p-2 rounded-lg text-xs space-y-1 cursor-move',
                                  hasConflict ? 'bg-red-500/20 border border-red-500' : 'bg-primary/10 border border-primary/20'
                                )}
                                draggable={isAdmin}
                                onDragStart={(e) => handleDragStart(e, entry)}
                              >
                                <div className="font-semibold text-sm">
                                  {entry.modules?.name}
                                </div>
                                <div className="text-muted-foreground">
                                  {entry.modules?.code}
                                </div>
                                {entry.professors && (
                                  <div className="text-muted-foreground">
                                    👤 {entry.professors.name}
                                  </div>
                                )}
                                {entry.rooms && (
                                  <div className="text-muted-foreground">
                                    🚪 {entry.rooms.name}
                                  </div>
                                )}
                                {hasConflict && (
                                  <div className="flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="h-3 w-3" />
                                    {t.timetables.conflict}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {isAdmin && selectedId && (
          <p className="text-sm text-muted-foreground text-center">
            {t.timetables.dragToMove}
          </p>
        )}
      </div>
    </MainLayout>
  );
}
