import clsx from 'clsx';
import React from 'react';
import { SIZES } from '../types';
import './Checkbox.scss';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: SIZES;
  label?: string;
};

export const Checkbox = React.forwardRef(
  (
    { className, checked, inputSize = 'md', label, ...rest }: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <>
        <label
          className={clsx('Checkbox__container', {
            [`Checkbox__container--size--${inputSize}`]: inputSize,
          })}
        >
          {label}
          <input checked={checked} className={clsx('Checkbox', className)} ref={ref} type="checkbox" {...rest} />
          <span className="Checkbox__mark"></span>
        </label>
      </>
    );
  }
);
