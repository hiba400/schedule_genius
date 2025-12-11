import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  code: string;
  type: 'CM' | 'TD' | 'TP';
  nature: string;
  hours_cm: number;
  hours_td: number;
  hours_tp: number;
  program_id: string | null;
  programs?: { name: string } | null;
}

interface Program {
  id: string;
  name: string;
}

const moduleTypes = ['CM', 'TD', 'TP'] as const;
const moduleNatures = ['informatique', 'electronique', 'instrumentation', 'mathematiques', 'physique', 'langues', 'gestion', 'autre'] as const;

export default function Modules() {
  const { t } = useLanguage();
  const [modules, setModules] = useState<Module[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'CM' as 'CM' | 'TD' | 'TP',
    nature: 'informatique' as typeof moduleNatures[number],
    hours_cm: 0,
    hours_td: 0,
    hours_tp: 0,
    program_id: '',
  });

  const fetchData = async () => {
    const [modulesRes, programsRes] = await Promise.all([
      supabase.from('modules').select('*, programs(name)').order('name'),
      supabase.from('programs').select('id, name').order('name'),
    ]);

    if (modulesRes.data) setModules(modulesRes.data);
    if (programsRes.data) setPrograms(programsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'CM',
      nature: 'informatique',
      hours_cm: 0,
      hours_td: 0,
      hours_tp: 0,
      program_id: '',
    });
    setSelectedModule(null);
  };

  const openEditDialog = (module: Module) => {
    setSelectedModule(module);
    setFormData({
      name: module.name,
      code: module.code,
      type: module.type,
      nature: module.nature,
      hours_cm: module.hours_cm,
      hours_td: module.hours_td,
      hours_tp: module.hours_tp,
      program_id: module.program_id || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      program_id: formData.program_id || null,
    };

    if (selectedModule) {
      const { error } = await supabase
        .from('modules')
        .update(data)
        .eq('id', selectedModule.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('modules').insert(data);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchData();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedModule) return;

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', selectedModule.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.common.success);
      fetchData();
    }

    setDeleteDialogOpen(false);
    setSelectedModule(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.modules.title}</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.modules.add}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedModule ? t.modules.edit : t.modules.add}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.modules.name}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.modules.code}</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.modules.type}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t.modules.types[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.modules.nature}</Label>
                    <Select
                      value={formData.nature}
                      onValueChange={(value) => setFormData({ ...formData, nature: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleNatures.map((nature) => (
                          <SelectItem key={nature} value={nature}>
                            {t.modules.natures[nature as keyof typeof t.modules.natures]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t.modules.hoursCM}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.hours_cm}
                      onChange={(e) => setFormData({ ...formData, hours_cm: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.modules.hoursTD}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.hours_td}
                      onChange={(e) => setFormData({ ...formData, hours_td: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.modules.hoursTP}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.hours_tp}
                      onChange={(e) => setFormData({ ...formData, hours_tp: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.modules.program}</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.common.selectOption} />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit">{t.common.save}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : modules.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t.modules.noModules}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.modules.code}</TableHead>
                    <TableHead>{t.modules.name}</TableHead>
                    <TableHead>{t.modules.type}</TableHead>
                    <TableHead>{t.modules.nature}</TableHead>
                    <TableHead>{t.modules.program}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-mono">{module.code}</TableCell>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>{t.modules.types[module.type]}</TableCell>
                      <TableCell>{t.modules.natures[module.nature as keyof typeof t.modules.natures]}</TableCell>
                      <TableCell>{module.programs?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(module)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedModule(module);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.modules.delete}</AlertDialogTitle>
              <AlertDialogDescription>{t.modules.confirmDelete}</AlertDialogDescription>
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
