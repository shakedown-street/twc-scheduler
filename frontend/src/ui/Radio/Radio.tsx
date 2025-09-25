import clsx from 'clsx';
import React from 'react';
import { SIZES } from '../types';
import './Radio.scss';

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: SIZES;
  label?: string;
};

export const Radio = React.forwardRef(
  ({ className, inputSize = 'md', label, ...rest }: RadioProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    return (
      <>
        <label
          className={clsx('Radio__container', {
            [`Radio__container--size--${inputSize}`]: inputSize,
          })}
        >
          {label}
          <input className={clsx('Radio', className)} type="radio" ref={ref} {...rest} />
          <span className="Radio__mark"></span>
        </label>
      </>
    );
  },
);
