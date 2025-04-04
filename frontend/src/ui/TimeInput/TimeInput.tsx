import clsx from 'clsx';
import { format, parse } from 'date-fns';
import React from 'react';
import { generateTimeSlots } from '~/utils/time';
import { Input, InputProps } from '../Input/Input';
import { RadixPopover } from '../RadixPopover/RadixPopover';
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

  function formattedTime(time: string) {
    try {
      const parsedTime = parse(time, 'HH:mm:ss', new Date());
      return format(parsedTime, 'h:mm a');
    } catch (error) {
      return time;
    }
  }

  return (
    <>
      <RadixPopover
        align="start"
        close={false}
        trigger={<Input iconTrailing="schedule" readOnly type="text" value={formattedTime(value)} {...inputProps} />}
      >
        <div className="TimeInput__popover">
          <div className="TimeInput__slots">
            {timeSlots.map((slot) => {
              return (
                <div
                  key={slot}
                  className={clsx('TimeInput__slot', { 'TimeInput__slot--active': slot === value })}
                  onClick={() => onChange(slot)}
                >
                  {formattedTime(slot)}
                </div>
              );
            })}
          </div>
        </div>
      </RadixPopover>
    </>
  );
};
