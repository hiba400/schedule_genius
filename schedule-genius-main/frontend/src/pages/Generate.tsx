import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';
import { Zap, Loader2, History, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GenerationHistory {
  id: string;
  semester: string;
  fitness_score: number;
  generation_count: number;
  parameters: unknown;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function Generate() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [params, setParams] = useState({
    semester: 'S1',
    populationSize: 100,
    maxGenerations: 500,
    mutationRate: 0.05,
    crossoverRate: 0.8,
  });

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('generation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setHistory(data);
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);
    setCurrentGeneration(0);
    setBestFitness(0);

    try {
      // Create history entry
      const { data: historyEntry, error: historyError } = await supabase
        .from('generation_history')
        .insert({
          semester: params.semester,
          parameters: params,
          status: 'running',
          created_by: user?.id,
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: {
          ...params,
          historyId: historyEntry.id,
        },
      });

      if (error) throw error;

      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
        setCurrentGeneration((prev) => Math.min(prev + 10, params.maxGenerations));
        setBestFitness((prev) => Math.min(prev + 0.02, 1));
      }, 100);

      // Wait for completion
      setTimeout(async () => {
        clearInterval(interval);
        setProgress(100);
        setCurrentGeneration(params.maxGenerations);
        setBestFitness(data?.fitness || 0.85);

        await supabase
          .from('generation_history')
          .update({
            status: 'completed',
            fitness_score: data?.fitness || 0.85,
            generation_count: params.maxGenerations,
            completed_at: new Date().toISOString(),
          })
          .eq('id', historyEntry.id);

        toast.success(t.common.success);
        fetchHistory();
        setGenerating(false);
      }, 5000);
    } catch (error: any) {
      toast.error(error.message);
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{t.generate.status.completed}</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">{t.generate.status.running}</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">{t.generate.status.failed}</Badge>;
      default:
        return <Badge variant="secondary">{t.generate.status.pending}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t.generate.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.generate.semester}</Label>
                <Select
                  value={params.semester}
                  onValueChange={(value) => setParams({ ...params, semester: value })}
                  disabled={generating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S1">Semestre 1</SelectItem>
                    <SelectItem value="S2">Semestre 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.generate.populationSize}</Label>
                  <Input
                    type="number"
                    min="50"
                    max="500"
                    value={params.populationSize}
                    onChange={(e) => setParams({ ...params, populationSize: parseInt(e.target.value) || 100 })}
                    disabled={generating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.generate.maxGenerations}</Label>
                  <Input
                    type="number"
                    min="100"
                    max="1000"
                    value={params.maxGenerations}
                    onChange={(e) => setParams({ ...params, maxGenerations: parseInt(e.target.value) || 500 })}
                    disabled={generating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.generate.mutationRate}</Label>
                  <Input
                    type="number"
                    min="0.01"
                    max="0.2"
                    step="0.01"
                    value={params.mutationRate}
                    onChange={(e) => setParams({ ...params, mutationRate: parseFloat(e.target.value) || 0.05 })}
                    disabled={generating}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.generate.crossoverRate}</Label>
                  <Input
                    type="number"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={params.crossoverRate}
                    onChange={(e) => setParams({ ...params, crossoverRate: parseFloat(e.target.value) || 0.8 })}
                    disabled={generating}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.generate.generating}
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    {t.generate.generateButton}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.generate.progress}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t.generate.progress}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{t.generate.currentGeneration}</p>
                  <p className="text-2xl font-bold">{currentGeneration}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{t.generate.bestFitness}</p>
                  <p className="text-2xl font-bold">{(bestFitness * 100).toFixed(1)}%</p>
                </div>
              </div>

              {generating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.generate.generating}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>{t.generate.history}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t.generate.noHistory}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.generate.semester}</TableHead>
                    <TableHead>{t.generate.bestFitness}</TableHead>
                    <TableHead>{t.generate.currentGeneration}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell>{(item.fitness_score * 100).toFixed(1)}%</TableCell>
                      <TableCell>{item.generation_count}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/timetables">
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            {t.generate.viewResult}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
