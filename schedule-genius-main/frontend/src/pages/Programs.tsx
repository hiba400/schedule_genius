import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  size: number;
  program_id: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  level: string;
  groups: Group[];
}

export default function Programs() {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [deleteType, setDeleteType] = useState<'program' | 'group'>('program');

  const [programForm, setProgramForm] = useState({
    name: '',
    code: '',
    level: '',
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    size: 30,
  });

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*, groups(*)')
      .order('name');

    if (data) setPrograms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const resetProgramForm = () => {
    setProgramForm({ name: '', code: '', level: '' });
    setSelectedProgram(null);
  };

  const resetGroupForm = () => {
    setGroupForm({ name: '', size: 30 });
    setSelectedGroup(null);
  };

  const openEditProgramDialog = (program: Program) => {
    setSelectedProgram(program);
    setProgramForm({
      name: program.name,
      code: program.code,
      level: program.level,
    });
    setProgramDialogOpen(true);
  };

  const openAddGroupDialog = (program: Program) => {
    setSelectedProgram(program);
    resetGroupForm();
    setGroupDialogOpen(true);
  };

  const openEditGroupDialog = (program: Program, group: Group) => {
    setSelectedProgram(program);
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      size: group.size,
    });
    setGroupDialogOpen(true);
  };

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProgram && !groupDialogOpen) {
      const { error } = await supabase
        .from('programs')
        .update(programForm)
        .eq('id', selectedProgram.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    } else {
      const { error } = await supabase.from('programs').insert(programForm);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    }

    setProgramDialogOpen(false);
    resetProgramForm();
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGroup) {
      const { error } = await supabase
        .from('groups')
        .update(groupForm)
        .eq('id', selectedGroup.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    } else if (selectedProgram) {
      const { error } = await supabase.from('groups').insert({
        ...groupForm,
        program_id: selectedProgram.id,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    }

    setGroupDialogOpen(false);
    resetGroupForm();
  };

  const handleDelete = async () => {
    if (deleteType === 'program' && selectedProgram) {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', selectedProgram.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    } else if (deleteType === 'group' && selectedGroup) {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', selectedGroup.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchPrograms();
      }
    }

    setDeleteDialogOpen(false);
    setSelectedProgram(null);
    setSelectedGroup(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.programs.title}</h1>
          <Dialog open={programDialogOpen} onOpenChange={(open) => {
            setProgramDialogOpen(open);
            if (!open) resetProgramForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.programs.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProgram ? t.programs.edit : t.programs.add}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProgramSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.programs.name}</Label>
                  <Input
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.programs.code}</Label>
                  <Input
                    value={programForm.code}
                    onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.programs.level}</Label>
                  <Input
                    value={programForm.level}
                    onChange={(e) => setProgramForm({ ...programForm, level: e.target.value })}
                    placeholder="1A, 2A, 3A..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setProgramDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit">{t.common.save}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">{t.programs.noPrograms}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {program.code} • {program.level}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditProgramDialog(program)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProgram(program);
                        setDeleteType('program');
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.programs.groups}</span>
                    <Button size="sm" variant="outline" onClick={() => openAddGroupDialog(program)}>
                      <Plus className="mr-1 h-3 w-3" />
                      {t.programs.addGroup}
                    </Button>
                  </div>

                  {program.groups?.length > 0 ? (
                    <div className="space-y-2">
                      {program.groups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="secondary">{group.size}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditGroupDialog(program, group)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedGroup(group);
                                setDeleteType('group');
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      {t.common.noData}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={groupDialogOpen} onOpenChange={(open) => {
          setGroupDialogOpen(open);
          if (!open) resetGroupForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGroup ? t.programs.edit : t.programs.addGroup}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t.programs.groupName}</Label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Groupe A, G1..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t.programs.groupSize}</Label>
                <Input
                  type="number"
                  min="1"
                  value={groupForm.size}
                  onChange={(e) => setGroupForm({ ...groupForm, size: parseInt(e.target.value) || 30 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setGroupDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit">{t.common.save}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.common.delete}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteType === 'program' ? t.programs.confirmDelete : t.programs.confirmDelete}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {t.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
