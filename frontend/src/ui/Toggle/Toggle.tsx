import clsx from 'clsx';
import React from 'react';
import { SIZES } from '../types';
import './Toggle.scss';

export type ToggleLabelPosition = 'left' | 'right';

export type ToggleProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: SIZES;
  label?: string;
  labelPosition?: ToggleLabelPosition;
};

export const Toggle = React.forwardRef(
  (
    { checked, className, inputSize = 'md', label, labelPosition = 'left', ...rest }: ToggleProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <>
        <label
          className={clsx('Toggle__container', {
            [`Toggle__container--size--${inputSize}`]: inputSize,
          })}
        >
          {label && labelPosition === 'left' && label}
          <input checked={checked} className={clsx('Toggle', className)} ref={ref} type="checkbox" {...rest} />
          <div className="Toggle__control"></div>
          {label && labelPosition === 'right' && label}
        </label>
      </>
    );
  },
);
