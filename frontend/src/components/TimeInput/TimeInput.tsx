import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatTime, generateTimeSlots } from '@/utils/time';
import React from 'react';

export type TimeInputProps = React.ComponentProps<'input'> & {
  min: string;
  max: string;
  onChange: (value: string) => void;
  value: string;
};

export const TimeInput = ({ min, max, onChange, value }: TimeInputProps) => {
  const timeSlots = React.useMemo(() => {
    return generateTimeSlots(min, max, 15, true);
  }, [min, max]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Input readOnly type="text" value={formatTime(value)} />
        </PopoverTrigger>
        <PopoverContent>
          <div className="max-h-40 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              {timeSlots.map((slot) => {
                return (
                  <div
                    key={slot}
                    className={cn('pointer p-1', { 'bg-primary text-white': slot === value })}
                    onClick={() => onChange(slot)}
                  >
                    {formatTime(slot)}
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
