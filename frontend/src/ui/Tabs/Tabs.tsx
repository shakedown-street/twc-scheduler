import clsx from 'clsx';
import React from 'react';
import './Tabs.scss';

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  fluid?: boolean;
};

export const Tabs = ({ children, className, fluid, ...rest }: TabsProps) => {
  const [showNavLeft, setShowNavLeft] = React.useState(false);
  const [showNavRight, setShowNavRight] = React.useState(false);

  const tabsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tabsRef.current) {
      return;
    }

    setShowNavRight(tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth);
  }, [tabsRef.current, children]);

  function scroll(px: number) {
    if (!tabsRef.current) {
      return;
    }

    tabsRef.current.scrollTo({
      behavior: 'smooth',
      left: tabsRef.current.scrollLeft + px,
    });
  }

  function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const target = e.target as HTMLDivElement;

    if (!target) {
      return;
    }

    setShowNavLeft(target.scrollLeft > 0);
    setShowNavRight(target.scrollLeft < target.scrollWidth - target.clientWidth);
  }

  return (
    <div className="Tabs__container">
      {showNavLeft && (
        <button
          className="Tabs__navigate Tabs__navigate--left"
          onClick={() => {
            scroll(-300);
          }}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}
      <div
        className={clsx(
          'Tabs',
          {
            'Tabs--fluid': fluid,
          },
          className
        )}
        onScroll={(e) => {
          onScroll(e);
        }}
        ref={tabsRef}
        {...rest}
      >
        {children}
      </div>
      {showNavRight && (
        <button
          className="Tabs__navigate Tabs__navigate--right"
          onClick={() => {
            scroll(300);
          }}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}
    </div>
  );
};
