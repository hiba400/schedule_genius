import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface Constraint {
  id: string;
  type: 'module_room' | 'time_incompatibility' | 'capacity_rule' | 'professor_preference';
  params: unknown;
  priority: number;
  active: boolean;
}

const constraintTypes = ['module_room', 'time_incompatibility', 'capacity_rule', 'professor_preference'] as const;
type ConstraintType = typeof constraintTypes[number];

export default function Constraints() {
  const { t } = useLanguage();
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState<Constraint | null>(null);
  const [formData, setFormData] = useState({
    type: 'module_room' as ConstraintType,
    params: '{}',
    priority: 1,
    active: true,
  });

  const fetchConstraints = async () => {
    const { data, error } = await supabase
      .from('constraints')
      .select('*')
      .order('priority', { ascending: false });

    if (data) setConstraints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConstraints();
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'module_room',
      params: '{}',
      priority: 1,
      active: true,
    });
    setSelectedConstraint(null);
  };

  const openEditDialog = (constraint: Constraint) => {
    setSelectedConstraint(constraint);
    setFormData({
      type: constraint.type,
      params: JSON.stringify(constraint.params, null, 2),
      priority: constraint.priority,
      active: constraint.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let params;
    try {
      params = JSON.parse(formData.params);
    } catch {
      toast.error('Invalid JSON format for parameters');
      return;
    }

    const data = {
      type: formData.type,
      params,
      priority: formData.priority,
      active: formData.active,
    };

    if (selectedConstraint) {
      const { error } = await supabase
        .from('constraints')
        .update(data)
        .eq('id', selectedConstraint.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchConstraints();
      }
    } else {
      const { error } = await supabase.from('constraints').insert(data);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchConstraints();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleToggleActive = async (constraint: Constraint) => {
    const { error } = await supabase
      .from('constraints')
      .update({ active: !constraint.active })
      .eq('id', constraint.id);

    if (error) {
      toast.error(error.message);
    } else {
      fetchConstraints();
    }
  };

  const handleDelete = async () => {
    if (!selectedConstraint) return;

    const { error } = await supabase
      .from('constraints')
      .delete()
      .eq('id', selectedConstraint.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.common.success);
      fetchConstraints();
    }

    setDeleteDialogOpen(false);
    setSelectedConstraint(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module_room':
        return 'bg-blue-500';
      case 'time_incompatibility':
        return 'bg-red-500';
      case 'capacity_rule':
        return 'bg-green-500';
      case 'professor_preference':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.constraints.title}</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.constraints.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedConstraint ? t.constraints.edit : t.constraints.add}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.constraints.type}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {constraintTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t.constraints.types[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.constraints.params} (JSON)</Label>
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                    value={formData.params}
                    onChange={(e) => setFormData({ ...formData, params: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.constraints.priority}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>{t.constraints.active}</Label>
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
            ) : constraints.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t.constraints.noConstraints}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.constraints.type}</TableHead>
                    <TableHead>{t.constraints.priority}</TableHead>
                    <TableHead>{t.constraints.active}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {constraints.map((constraint) => (
                    <TableRow key={constraint.id}>
                      <TableCell>
                        <Badge className={getTypeColor(constraint.type)}>
                          {t.constraints.types[constraint.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{constraint.priority}</TableCell>
                      <TableCell>
                        <Switch
                          checked={constraint.active}
                          onCheckedChange={() => handleToggleActive(constraint)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(constraint)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedConstraint(constraint);
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
              <AlertDialogTitle>{t.constraints.delete}</AlertDialogTitle>
              <AlertDialogDescription>{t.constraints.confirmDelete}</AlertDialogDescription>
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
