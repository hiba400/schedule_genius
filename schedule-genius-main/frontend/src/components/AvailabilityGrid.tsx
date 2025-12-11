import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AvailabilityGridProps {
  availability: boolean[][];
  onChange: (day: number, slot: number, available: boolean) => void;
  readonly?: boolean;
}

export function AvailabilityGrid({ availability, onChange, readonly = false }: AvailabilityGridProps) {
  const { t, isRTL } = useLanguage();

  const days = [0, 1, 2, 3, 4];
  const slots = [0, 1, 2, 3];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>{t.availability.available}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded" />
          <span>{t.availability.unavailable}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-border bg-muted" />
              {days.map((day) => (
                <th key={day} className="p-2 border border-border bg-muted text-sm font-medium">
                  {t.time.days[day.toString() as keyof typeof t.time.days]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot}>
                <td className="p-2 border border-border bg-muted text-sm font-medium whitespace-nowrap">
                  {t.time.slots[slot.toString() as keyof typeof t.time.slots]}
                </td>
                {days.map((day) => {
                  const isAvailable = availability[day]?.[slot] ?? true;
                  return (
                    <td
                      key={day}
                      className={cn(
                        'p-2 border border-border text-center transition-colors',
                        isAvailable ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-red-500/20 hover:bg-red-500/30',
                        !readonly && 'cursor-pointer'
                      )}
                      onClick={() => !readonly && onChange(day, slot, !isAvailable)}
                    >
                      {isAvailable ? '✓' : '✗'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readonly && (
        <p className="text-xs text-muted-foreground">{t.availability.clickToToggle}</p>
      )}
    </div>
  );
}
