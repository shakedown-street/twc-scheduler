import clsx from 'clsx';
import React from 'react';
import './TabItem.scss';

export type TabItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const TabItem = ({ active, children, className, onClick, ...rest }: TabItemProps) => {
  return (
    <>
      <button
        className={clsx(
          'TabItem',
          {
            'TabItem--active': active,
          },
          className
        )}
        onClick={(e) => {
          const target = e.target as HTMLButtonElement;

          if (!target) {
            return;
          }

          target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

          if (onClick) {
            onClick(e);
          }
        }}
        {...rest}
      >
        {children}
      </button>
    </>
  );
};
