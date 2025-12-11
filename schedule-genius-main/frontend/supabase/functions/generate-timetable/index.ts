import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Module {
  id: string;
  name: string;
  code: string;
  type: string;
  hours_cm: number;
  hours_td: number;
  hours_tp: number;
}

interface Professor {
  id: string;
  name: string;
  max_hours_per_week: number;
}

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
}

interface Group {
  id: string;
  name: string;
  size: number;
  program_id: string;
}

interface Availability {
  professor_id: string;
  day_of_week: number;
  slot_index: number;
  available: boolean;
}

interface TimetableEntry {
  group_id: string;
  module_id: string;
  professor_id: string;
  room_id: string;
  day_of_week: number;
  slot_index: number;
  semester: string;
  session_type: string;
}

interface Chromosome {
  entries: TimetableEntry[];
  fitness: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { semester, populationSize, maxGenerations, mutationRate, crossoverRate, historyId } = await req.json();

    console.log('Starting timetable generation with params:', { semester, populationSize, maxGenerations });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all required data
    const [modulesRes, professorsRes, roomsRes, groupsRes, availabilityRes] = await Promise.all([
      supabase.from('modules').select('*'),
      supabase.from('professors').select('*'),
      supabase.from('rooms').select('*'),
      supabase.from('groups').select('*'),
      supabase.from('availability').select('*'),
    ]);

    const modules: Module[] = modulesRes.data || [];
    const professors: Professor[] = professorsRes.data || [];
    const rooms: Room[] = roomsRes.data || [];
    const groups: Group[] = groupsRes.data || [];
    const availability: Availability[] = availabilityRes.data || [];

    console.log(`Loaded: ${modules.length} modules, ${professors.length} professors, ${rooms.length} rooms, ${groups.length} groups`);

    if (modules.length === 0 || professors.length === 0 || rooms.length === 0 || groups.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Not enough data to generate timetable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Build availability map
    const availabilityMap = new Map<string, boolean>();
    availability.forEach(a => {
      availabilityMap.set(`${a.professor_id}-${a.day_of_week}-${a.slot_index}`, a.available);
    });

    const isProfessorAvailable = (profId: string, day: number, slot: number): boolean => {
      const key = `${profId}-${day}-${slot}`;
      return availabilityMap.get(key) !== false; // Default to available
    };

    // Generate random chromosome
    const generateRandomChromosome = (): Chromosome => {
      const entries: TimetableEntry[] = [];
      
      groups.forEach(group => {
        modules.forEach(module => {
          // Assign a random slot for each module-group pair
          const day = Math.floor(Math.random() * 5);
          const slot = Math.floor(Math.random() * 4);
          const professor = professors[Math.floor(Math.random() * professors.length)];
          const room = rooms[Math.floor(Math.random() * rooms.length)];

          entries.push({
            group_id: group.id,
            module_id: module.id,
            professor_id: professor.id,
            room_id: room.id,
            day_of_week: day,
            slot_index: slot,
            semester,
            session_type: module.type,
          });
        });
      });

      return { entries, fitness: 0 };
    };

    // Calculate fitness
    const calculateFitness = (chromosome: Chromosome): number => {
      let score = 1.0;
      const violations = {
        professorConflict: 0,
        roomConflict: 0,
        groupConflict: 0,
        availabilityViolation: 0,
      };

      const slotUsage = new Map<string, TimetableEntry[]>();

      chromosome.entries.forEach(entry => {
        const slotKey = `${entry.day_of_week}-${entry.slot_index}`;
        if (!slotUsage.has(slotKey)) {
          slotUsage.set(slotKey, []);
        }
        slotUsage.get(slotKey)!.push(entry);
      });

      // Check for conflicts
      slotUsage.forEach((entries) => {
        const professorIds = new Set<string>();
        const roomIds = new Set<string>();
        const groupIds = new Set<string>();

        entries.forEach(entry => {
          // Professor conflict
          if (professorIds.has(entry.professor_id)) {
            violations.professorConflict++;
          }
          professorIds.add(entry.professor_id);

          // Room conflict
          if (roomIds.has(entry.room_id)) {
            violations.roomConflict++;
          }
          roomIds.add(entry.room_id);

          // Group conflict
          if (groupIds.has(entry.group_id)) {
            violations.groupConflict++;
          }
          groupIds.add(entry.group_id);

          // Availability violation
          if (!isProfessorAvailable(entry.professor_id, entry.day_of_week, entry.slot_index)) {
            violations.availabilityViolation++;
          }
        });
      });

      // Apply penalties
      score -= violations.professorConflict * 0.1;
      score -= violations.roomConflict * 0.1;
      score -= violations.groupConflict * 0.1;
      score -= violations.availabilityViolation * 0.05;

      return Math.max(0, score);
    };

    // Crossover
    const crossover = (parent1: Chromosome, parent2: Chromosome): Chromosome => {
      const crossoverPoint = Math.floor(parent1.entries.length / 2);
      const childEntries = [
        ...parent1.entries.slice(0, crossoverPoint),
        ...parent2.entries.slice(crossoverPoint),
      ];
      return { entries: childEntries, fitness: 0 };
    };

    // Mutation
    const mutate = (chromosome: Chromosome, rate: number): Chromosome => {
      const mutatedEntries = chromosome.entries.map(entry => {
        if (Math.random() < rate) {
          return {
            ...entry,
            day_of_week: Math.floor(Math.random() * 5),
            slot_index: Math.floor(Math.random() * 4),
            professor_id: professors[Math.floor(Math.random() * professors.length)].id,
            room_id: rooms[Math.floor(Math.random() * rooms.length)].id,
          };
        }
        return entry;
      });
      return { entries: mutatedEntries, fitness: 0 };
    };

    // Selection (tournament)
    const select = (population: Chromosome[]): Chromosome => {
      const tournamentSize = 5;
      let best: Chromosome | null = null;
      for (let i = 0; i < tournamentSize; i++) {
        const candidate = population[Math.floor(Math.random() * population.length)];
        if (!best || candidate.fitness > best.fitness) {
          best = candidate;
        }
      }
      return best!;
    };

    // Initialize population
    console.log('Initializing population...');
    let population: Chromosome[] = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(generateRandomChromosome());
    }

    // Calculate initial fitness
    population.forEach(c => {
      c.fitness = calculateFitness(c);
    });

    // Evolution loop
    console.log('Starting evolution...');
    let bestFitness = 0;
    let bestChromosome: Chromosome | null = null;

    for (let gen = 0; gen < maxGenerations; gen++) {
      // Sort by fitness
      population.sort((a, b) => b.fitness - a.fitness);

      // Track best
      if (population[0].fitness > bestFitness) {
        bestFitness = population[0].fitness;
        bestChromosome = population[0];
      }

      // Early termination if perfect solution found
      if (bestFitness >= 0.99) {
        console.log(`Perfect solution found at generation ${gen}`);
        break;
      }

      // Elitism - keep top 10%
      const eliteCount = Math.floor(populationSize * 0.1);
      const newPopulation = population.slice(0, eliteCount);

      // Generate new population
      while (newPopulation.length < populationSize) {
        const parent1 = select(population);
        const parent2 = select(population);

        let child: Chromosome;
        if (Math.random() < crossoverRate) {
          child = crossover(parent1, parent2);
        } else {
          child = { ...parent1 };
        }

        child = mutate(child, mutationRate);
        child.fitness = calculateFitness(child);
        newPopulation.push(child);
      }

      population = newPopulation;

      if (gen % 50 === 0) {
        console.log(`Generation ${gen}: Best fitness = ${bestFitness.toFixed(4)}`);
      }
    }

    console.log(`Evolution complete. Best fitness: ${bestFitness.toFixed(4)}`);

    // Save best solution to database
    if (bestChromosome) {
      // Clear existing entries for this semester
      await supabase.from('timetable_entries').delete().eq('semester', semester);

      // Insert new entries
      const { error } = await supabase.from('timetable_entries').insert(bestChromosome.entries);
      
      if (error) {
        console.error('Error saving timetable:', error);
      } else {
        console.log(`Saved ${bestChromosome.entries.length} timetable entries`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fitness: bestFitness,
        entriesCount: bestChromosome?.entries.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-timetable:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
