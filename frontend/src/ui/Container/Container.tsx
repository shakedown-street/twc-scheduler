import clsx from 'clsx';
import React from 'react';
import './Container.scss';

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {};

export const Container = ({ className, ...rest }: ContainerProps) => {
  return <div className={clsx('Container', className)} {...rest} />;
};
