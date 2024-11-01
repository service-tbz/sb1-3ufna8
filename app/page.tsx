"use client";

import React, { useState, useCallback, useRef, Suspense} from 'react';
// import dynamic from 'next/dynamic';
import { MapContainer } from '@/components/MapContainer';
import { Header } from '@/components/Header';
import { useJsApiLoader } from '@react-google-maps/api';
import type { MapHandle, MapProps } from '@/components/Map';




// 動的に `Map` コンポーネントをインポートし、`ref` を渡せるように `forwardRef` でラップ
// const DynamicMap = dynamic(() => import('@/components/Map').then((mod) => mod.Map), {
//   ssr: false,
//   loading: () => <p>Loading map...</p>,
// });

// const ForwardedMap = React.forwardRef<MapHandle, MapProps>((props, ref) => (
//   <DynamicMap {...props} ref={ref} />
// ));
// ForwardedMap.displayName = 'ForwardedMap';

// `React.lazy` を使用して `Map` コンポーネントをインポート
const Map = React.lazy(() => import('@/components/Map'));

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["drawing"];

export default function Home() {
  const [userType, setUserType] = useState<'municipality' | 'operator' | 'resident'>('municipality');
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAWgeoLW_h-AoDEz1VDrl4TuamvZA4XZic',
    libraries,
  });

  const mapRef = useRef<MapHandle>(null);

  const handleClearOverlays = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.clearOverlays();
    }
  }, []);

  const handleConfirmDrawing = useCallback(() => {
    console.log('handleConfirmDrawing called');
    if (mapRef.current) {
      console.log('mapRef.current is defined');
      mapRef.current.confirmDrawing();
    } else {
      console.log('mapRef.current is null');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        userType={userType} 
        setUserType={setUserType} 
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        clearOverlays={handleClearOverlays}
        isLoaded={isLoaded}
        onConfirmDrawing={handleConfirmDrawing}
      />
      <MapContainer>
        {isLoaded ? (
          <Suspense fallback={<div>Loading map...</div>}>
          <Map 
            ref={mapRef} // `ref` を渡す
            userType={userType} 
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
          />
        </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Loading map...</p>
          </div>
        )}
      </MapContainer>
    </div>
  );
}
