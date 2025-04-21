import clsx from 'clsx';
import React from 'react';
import './Container.scss';

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  fluid?: boolean;
};

export const Container = ({ className, fluid = false, ...rest }: ContainerProps) => {
  return <div className={clsx('Container', { 'Container--fluid': fluid }, className)} {...rest} />;
};
