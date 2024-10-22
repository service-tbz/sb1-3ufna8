import React from 'react';

type MapContainerProps = {
  children: React.ReactNode;
};

export function MapContainer({ children }: MapContainerProps) {
  return (
    <div className="flex-grow relative">
      {children}
    </div>
  );
}