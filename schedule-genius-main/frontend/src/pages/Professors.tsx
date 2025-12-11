import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';

interface Professor {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  max_hours_per_week: number;
}

interface Availability {
  professor_id: string;
  day_of_week: number;
  slot_index: number;
  available: boolean;
}

export default function Professors() {
  const { t } = useLanguage();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [availability, setAvailability] = useState<boolean[][]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialties: '',
    max_hours_per_week: 20,
  });

  const fetchProfessors = async () => {
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .order('name');

    if (data) setProfessors(data);
    setLoading(false);
  };

  const fetchAvailability = async (professorId: string) => {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('professor_id', professorId);

    // Initialize 5x4 grid with all available
    const grid: boolean[][] = Array(5).fill(null).map(() => Array(4).fill(true));

    if (data) {
      data.forEach((a) => {
        if (grid[a.day_of_week]) {
          grid[a.day_of_week][a.slot_index] = a.available;
        }
      });
    }

    setAvailability(grid);
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      specialties: '',
      max_hours_per_week: 20,
    });
    setSelectedProfessor(null);
  };

  const openEditDialog = (professor: Professor) => {
    setSelectedProfessor(professor);
    setFormData({
      name: professor.name,
      email: professor.email,
      specialties: professor.specialties?.join(', ') || '',
      max_hours_per_week: professor.max_hours_per_week,
    });
    setDialogOpen(true);
  };

  const openAvailabilityDialog = async (professor: Professor) => {
    setSelectedProfessor(professor);
    await fetchAvailability(professor.id);
    setAvailabilityDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      email: formData.email,
      specialties: formData.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      max_hours_per_week: formData.max_hours_per_week,
    };

    if (selectedProfessor) {
      const { error } = await supabase
        .from('professors')
        .update(data)
        .eq('id', selectedProfessor.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchProfessors();
      }
    } else {
      const { error } = await supabase.from('professors').insert(data);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchProfessors();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleAvailabilityChange = async (day: number, slot: number, available: boolean) => {
    if (!selectedProfessor) return;

    const newAvailability = [...availability];
    newAvailability[day][slot] = available;
    setAvailability(newAvailability);

    // Upsert availability
    const { error } = await supabase.from('availability').upsert(
      {
        professor_id: selectedProfessor.id,
        day_of_week: day,
        slot_index: slot,
        available,
      },
      { onConflict: 'professor_id,day_of_week,slot_index' }
    );

    if (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedProfessor) return;

    const { error } = await supabase
      .from('professors')
      .delete()
      .eq('id', selectedProfessor.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.common.success);
      fetchProfessors();
    }

    setDeleteDialogOpen(false);
    setSelectedProfessor(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.professors.title}</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.professors.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProfessor ? t.professors.edit : t.professors.add}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.professors.name}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.professors.email}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.professors.specialties}</Label>
                  <Input
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="Informatique, Électronique, ..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.professors.maxHours}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.max_hours_per_week}
                    onChange={(e) => setFormData({ ...formData, max_hours_per_week: parseInt(e.target.value) || 20 })}
                  />
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
            ) : professors.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t.professors.noProfessors}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.professors.name}</TableHead>
                    <TableHead>{t.professors.email}</TableHead>
                    <TableHead>{t.professors.specialties}</TableHead>
                    <TableHead>{t.professors.maxHours}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professors.map((professor) => (
                    <TableRow key={professor.id}>
                      <TableCell className="font-medium">{professor.name}</TableCell>
                      <TableCell>{professor.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professor.specialties?.map((s, i) => (
                            <Badge key={i} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{professor.max_hours_per_week}h</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAvailabilityDialog(professor)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(professor)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProfessor(professor);
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

        <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {t.professors.availability} - {selectedProfessor?.name}
              </DialogTitle>
            </DialogHeader>
            <AvailabilityGrid
              availability={availability}
              onChange={handleAvailabilityChange}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.professors.delete}</AlertDialogTitle>
              <AlertDialogDescription>{t.professors.confirmDelete}</AlertDialogDescription>
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
