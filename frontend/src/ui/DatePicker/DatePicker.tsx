import clsx from 'clsx';
import { addMonths, format, getDay, getDaysInMonth, getMonth, getYear, isSameDay, setDate, subMonths } from 'date-fns';
import React from 'react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Input } from '../Input/Input';
import { RadixPopover } from '../RadixPopover/RadixPopover';
import './DatePicker.scss';

export type DatePickerProps = {
  fluid?: boolean;
  onChange?: (value: Date | undefined) => void;
  value?: Date;
};

const MAX_YEARS = 2000;
const YEARS_AHEAD = 1000;

export const DatePicker = ({ fluid, onChange, value }: DatePickerProps) => {
  const now = new Date();
  const initialDate = value ? value : now;
  const [calendarDate, setCalendarDate] = React.useState(initialDate);
  const [selectingYear, setSelectingYear] = React.useState(false);
  const daysInMonth = getDaysInMonth(calendarDate);
  const firstDayWeekday = getDay(setDate(calendarDate, 1));

  const yearRefs = React.useRef<any[]>([]);
  yearRefs.current = Array(MAX_YEARS)
    .fill(null)
    .map((_, i) => yearRefs.current[i] || React.createRef());

  React.useEffect(() => {
    if (!value) {
      return;
    }
    setCalendarDate(value);
  }, [value]);

  React.useEffect(() => {
    if (selectingYear) {
      const yearIndex = getYear(calendarDate) - (getYear(now) - (MAX_YEARS - YEARS_AHEAD));
      yearRefs.current[yearIndex].current?.scrollIntoView({ block: 'center' });
    }
  }, [selectingYear]);

  function back(months = 1) {
    const backDate = subMonths(calendarDate, months);
    setCalendarDate(backDate);
  }

  function forward(months = 1) {
    const forwardDate = addMonths(calendarDate, months);
    setCalendarDate(forwardDate);
  }

  function clickDay(day: number) {
    const newSelected = new Date(getYear(calendarDate), getMonth(calendarDate), day);

    if (value && isSameDay(newSelected, value)) {
      onChange?.(undefined);
    } else {
      onChange?.(newSelected);
    }
  }

  function clickYear(year: number) {
    if (value) {
      const newSelected = new Date(year, value.getMonth(), value.getDate());
      onChange?.(newSelected);
    } else {
      const newSelected = new Date(year, 0, 1);
      onChange?.(newSelected);
    }
  }

  function dayIsSelected(day: number) {
    if (!day || !value) {
      return false;
    }
    const date = new Date(getYear(calendarDate), getMonth(calendarDate), day);
    return isSameDay(date, value);
  }

  function daysInMonthArray() {
    const dim = [];
    for (let i = 0; i < daysInMonth; i++) {
      dim.push(i + 1);
    }
    return dim;
  }

  function sliceIntoChunks(arr: any[], chunkSize: number) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }

  function weekChunk() {
    const dimArray = daysInMonthArray();
    const firstWeek = []; // e.g: [null, null, null, null, null, 1, 2]
    let lastDayInFirstWeek = 0;
    const rest = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      firstWeek.push(null);
    }
    for (let i = firstDayWeekday; i < 7; i++) {
      firstWeek.push(dimArray[i - firstDayWeekday]);
      lastDayInFirstWeek = i - firstDayWeekday;
    }
    for (let i = lastDayInFirstWeek + 1; i < dimArray.length; i++) {
      rest.push(dimArray[i]);
    }
    return sliceIntoChunks(firstWeek.concat(rest), 7);
  }

  return (
    <>
      <RadixPopover
        close={false}
        trigger={
          <Input
            fluid={fluid}
            iconLeading="calendar_month"
            readOnly
            style={{
              cursor: 'pointer',
            }}
            type="text"
            value={value ? format(value, 'MMMM d, yyyy') : ''}
          />
        }
      >
        <div className="DatePicker">
          <div className="DatePicker__toolbar">
            <Button
              className="DatePicker__toolbar__button"
              iconTrailing={selectingYear ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              onClick={() => {
                setSelectingYear(!selectingYear);
              }}
              size="sm"
            >
              {format(calendarDate, 'MMMM yyyy')}
            </Button>
            {!selectingYear && (
              <>
                <IconButton
                  onClick={() => {
                    back();
                  }}
                  size="sm"
                >
                  <span className="material-symbols-outlined">keyboard_arrow_left</span>
                </IconButton>
                <IconButton
                  onClick={() => {
                    forward();
                  }}
                  size="sm"
                >
                  <span className="material-symbols-outlined">keyboard_arrow_right</span>
                </IconButton>
              </>
            )}
          </div>
          <div className="DatePicker__main">
            {selectingYear ? (
              <>
                <ul className="DatePicker__yearList">
                  {[...Array(MAX_YEARS)].map((_, i) => {
                    const year = getYear(now) - (MAX_YEARS - YEARS_AHEAD) + i;
                    return (
                      <li
                        className={clsx('DatePicker__yearList__item', {
                          'DatePicker__yearList__item--selected': value && year === getYear(value),
                        })}
                        ref={yearRefs.current[i]}
                        key={i}
                        onClick={() => {
                          clickYear(year);
                          setSelectingYear(false);
                        }}
                      >
                        {year}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                <div className="DatePicker__calendar">
                  <table>
                    <thead>
                      <tr>
                        <th>S</th>
                        <th>M</th>
                        <th>T</th>
                        <th>W</th>
                        <th>T</th>
                        <th>F</th>
                        <th>S</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekChunk().map((week, weekIndex) => {
                        return (
                          <tr key={weekIndex}>
                            {week.map((day, dayIndex) => {
                              return (
                                <td
                                  key={dayIndex}
                                  className={dayIsSelected(day) ? 'DatePicker__selected' : undefined}
                                  onClick={() => {
                                    clickDay(day);
                                  }}
                                >
                                  {day}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </RadixPopover>
    </>
  );
};
