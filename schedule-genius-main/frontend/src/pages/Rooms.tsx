import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
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

interface Room {
  id: string;
  name: string;
  type: 'amphi' | 'td' | 'tp' | 'specialisee';
  capacity: number;
  equipment: string[];
}

const roomTypes = ['amphi', 'td', 'tp', 'specialisee'] as const;

export default function Rooms() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'td' as 'amphi' | 'td' | 'tp' | 'specialisee',
    capacity: 30,
    equipment: '',
  });

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');

    if (data) setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'td',
      capacity: 30,
      equipment: '',
    });
    setSelectedRoom(null);
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      equipment: room.equipment?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      equipment: formData.equipment.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (selectedRoom) {
      const { error } = await supabase
        .from('rooms')
        .update(data)
        .eq('id', selectedRoom.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchRooms();
      }
    } else {
      const { error } = await supabase.from('rooms').insert(data);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t.common.success);
        fetchRooms();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', selectedRoom.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.common.success);
      fetchRooms();
    }

    setDeleteDialogOpen(false);
    setSelectedRoom(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'amphi':
        return 'bg-purple-500';
      case 'td':
        return 'bg-blue-500';
      case 'tp':
        return 'bg-green-500';
      case 'specialisee':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.rooms.title}</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.rooms.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedRoom ? t.rooms.edit : t.rooms.add}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.rooms.name}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.rooms.type}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t.rooms.types[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.rooms.capacity}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.rooms.equipment}</Label>
                  <Input
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Vidéoprojecteur, Ordinateurs, ..."
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
            ) : rooms.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t.rooms.noRooms}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.rooms.name}</TableHead>
                    <TableHead>{t.rooms.type}</TableHead>
                    <TableHead>{t.rooms.capacity}</TableHead>
                    <TableHead>{t.rooms.equipment}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(room.type)}>
                          {t.rooms.types[room.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment?.map((e, i) => (
                            <Badge key={i} variant="outline">{e}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRoom(room);
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
              <AlertDialogTitle>{t.rooms.delete}</AlertDialogTitle>
              <AlertDialogDescription>{t.rooms.confirmDelete}</AlertDialogDescription>
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
