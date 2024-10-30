"use client"

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer } from '@/components/MapContainer';
import { Header } from '@/components/Header';
import { useJsApiLoader } from '@react-google-maps/api';

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <p>Loading map...</p>,
  ssr: false
});

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["drawing"];

export default function Home() {
  const [userType, setUserType] = useState<'municipality' | 'operator' | 'resident'>('municipality');
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);
  const [clearFn, setClearFn] = useState<(() => void) | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAWgeoLW_h-AoDEz1VDrl4TuamvZA4XZic',
    libraries,
  });

  const handleSetClearFn = useCallback((fn: () => void) => {
    console.log("Clear function registered");
    setClearFn(() => fn);
  }, []);

  const handleClearOverlays = useCallback(() => {
    console.log("Executing clear function");
    if (clearFn) {
      clearFn();
    }
  }, [clearFn]);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        userType={userType} 
        setUserType={setUserType} 
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        onClearOverlays={handleClearOverlays}
        isLoaded={isLoaded}
      />
      <MapContainer>
        {isLoaded ? (
          <Map 
            userType={userType} 
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            onClearOverlays={handleSetClearFn}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Loading map...</p>
          </div>
        )}
      </MapContainer>
    </div>
  );
}