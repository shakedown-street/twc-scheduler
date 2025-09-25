import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatTime, generateTimeSlots } from '@/utils/time';
import clsx from 'clsx';
import React from 'react';
import { Input, InputProps } from '../Input/Input';
import './TimeInput.scss';

export type TimeInputProps = {
  inputProps?: Omit<InputProps, 'readOnly' | 'value' | 'iconTrailing'>;
  min: string;
  max: string;
  onChange: (value: string) => void;
  value: string;
};

export const TimeInput = ({ inputProps, min, max, onChange, value }: TimeInputProps) => {
  const timeSlots = React.useMemo(() => {
    return generateTimeSlots(min, max, 15, true);
  }, [min, max]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Input iconTrailing="schedule" readOnly type="text" value={formatTime(value)} {...inputProps} />
        </PopoverTrigger>
        <PopoverContent>
          <div className="TimeInput__popover">
            <div className="TimeInput__slots">
              {timeSlots.map((slot) => {
                return (
                  <div
                    key={slot}
                    className={clsx('TimeInput__slot', { 'TimeInput__slot--active': slot === value })}
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
