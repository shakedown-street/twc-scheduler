import clsx from 'clsx';
import React from 'react';
import { SIZES } from '../types';
import './Spinner.scss';

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  message?: string;
  size?: SIZES;
};

export const Spinner = ({ className, message, size = 'md', ...rest }: SpinnerProps) => {
  return (
    <div className="Spinner__container">
      <div
        className={clsx(
          'Spinner',
          {
            [`Spinner--size--${size}`]: size,
          },
          className
        )}
        {...rest}
      ></div>
      {message && <div className="Spinner__message">{message}</div>}
    </div>
  );
};
