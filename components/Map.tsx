// Map.tsx
"use client";

import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GoogleMap, Polygon, Polyline, Marker } from '@react-google-maps/api';
import { useToast } from "@/components/ui/use-toast";

// `MapHandle` インターフェースを定義
export interface MapHandle {
  confirmDrawing: () => void;
  clearOverlays: () => void;
}

// `MapProps` の型定義
export type MapProps = {
  userType: 'municipality' | 'operator' | 'resident';
  drawingMode: google.maps.drawing.OverlayType | null;
  setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
};

// Map.tsx
// 型定義を追加または更新
type Overlay = {
  type: google.maps.drawing.OverlayType;
  overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker;
  options: google.maps.PolygonOptions | google.maps.PolylineOptions | google.maps.MarkerOptions;
  apiObject?: google.maps.Polygon | google.maps.Polyline | google.maps.Marker; // ネイティブオブジェクトを保持するプロパティを追加
};


// Map.tsx
const [overlays, setOverlays] = useState<Overlay[]>([]);


// `Map` コンポーネントを `forwardRef` で定義し、`ref` を直接使用
const Map = forwardRef<MapHandle, MapProps>((props, ref) => {
  const { userType, drawingMode, setDrawingMode } = props;

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [overlays, setOverlays] = useState<any[]>([]);

  const { toast } = useToast();

  // オーバーレイをクリアする関数
  const clearOverlays = useCallback(() => {
    overlays.forEach(({ overlay }) => overlay.setMap(null));
    setOverlays([]);
    toast({
      title: "Cleared",
      description: "All overlays have been removed from the map.",
    });
  }, [overlays, toast]);

  // 描画を確定する関数
  // const confirmDrawing = useCallback(() => {
  //   if (overlays.length === 0) {
  //     toast({
  //       title: "No Overlays",
  //       description: "There are no overlays to confirm.",
  //     });
  //     return;
  //   }

  //   const lastOverlay = overlays[overlays.length - 1];

  //   const updatedOverlays = overlays.map((ov, idx) => {
  //     if (idx === overlays.length - 1) {
  //       return {
  //         ...ov,
  //         options: {
  //           ...ov.options,
  //           editable: false,
  //         },
  //       };
  //     }
  //     return ov;
  //   });

  //   if (lastOverlay.type === google.maps.drawing.OverlayType.POLYGON) {
  //     const polygon = lastOverlay.overlay as google.maps.Polygon;
  //     polygon.setEditable(false); // 編集不可に設定
  //     toast({
  //       title: "No-fly zone confirmed",
  //       description: "The no-fly zone has been confirmed and is now non-editable.",
  //     });
  //   } else if (lastOverlay.type === google.maps.drawing.OverlayType.POLYLINE) {
  //     const polyline = lastOverlay.overlay as google.maps.Polyline;
  //     polyline.setEditable(false); // 編集不可に設定
  //     toast({
  //       title: "Flight path confirmed",
  //       description: "The flight path has been confirmed and is now non-editable.",
  //     });
  //   }

  //   setOverlays(updatedOverlays);
  //   setDrawingMode(null);
  // }, [overlays, toast, setDrawingMode]);

  const confirmDrawing = useCallback(() => {
    try {
      console.log('confirmDrawing function called');
  
      if (overlays.length === 0) {
        toast({
          title: "No Overlays",
          description: "There are no overlays to confirm.",
        });
        return;
      }
  
      const lastOverlay = overlays[overlays.length - 1];
      console.log('Last overlay:', lastOverlay);
  
      const updatedOverlays = overlays.map((ov, idx) => {
        if (idx === overlays.length - 1) {
          return {
            ...ov,
            options: {
              ...ov.options,
              editable: false,
            },
          };
        }
        return ov;
      });
  
      if (lastOverlay.type === google.maps.drawing.OverlayType.POLYGON) {
        const polygon = lastOverlay.overlay as google.maps.Polygon;
        polygon.setEditable(false);
        toast({
          title: "No-fly zone confirmed",
          description: "The no-fly zone has been confirmed and is now non-editable.",
        });
      } else if (lastOverlay.type === google.maps.drawing.OverlayType.POLYLINE) {
        const polyline = lastOverlay.overlay as google.maps.Polyline;
        polyline.setEditable(false);
        toast({
          title: "Flight path confirmed",
          description: "The flight path has been confirmed and is now non-editable.",
        });
      } else {
        console.error('Unknown overlay type:', lastOverlay.type);
      }
  
      setOverlays(updatedOverlays);
      setDrawingMode(null);
  
      console.log('confirmDrawing function completed successfully');
    } catch (error) {
      console.error('Error in confirmDrawing:', error);
    }
  }, [overlays, toast, setDrawingMode]);
  

  // `useImperativeHandle` で親コンポーネントから関数を呼び出せるようにする
  useImperativeHandle(ref, () => ({
    confirmDrawing,
    clearOverlays,
  }), [confirmDrawing, clearOverlays]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleOverlayComplete = useCallback((event: google.maps.drawing.OverlayCompleteEvent) => {
    const newOverlay: any = {
      type: event.type,
      overlay: event.overlay,
      options: event.type === google.maps.drawing.OverlayType.POLYGON
        ? { fillColor: "#FF0000", fillOpacity: 0.35, strokeWeight: 2, editable: true }
        : event.type === google.maps.drawing.OverlayType.POLYLINE
        ? { strokeColor: "#0000FF", strokeWeight: 2, editable: true }
        : { },
    };
    setOverlays(prevOverlays => [...prevOverlays, newOverlay]);

    toast({
      title: event.type === google.maps.drawing.OverlayType.POLYGON ? "No-fly zone created" : "Flight path created",
      description: "A new overlay has been added to the map.",
    });

    setDrawingMode(null);
  }, [toast, setDrawingMode]);

  useEffect(() => {
    if (map && window.google && window.google.maps && window.google.maps.drawing) {
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: drawingMode,
        drawingControl: false,
        polygonOptions: { fillColor: "#FF0000", fillOpacity: 0.35, strokeWeight: 2, editable: true },
        polylineOptions: { strokeColor: "#0000FF", strokeWeight: 2, editable: true },
        markerOptions: { },
      });
      drawingManager.setMap(map);

      const listener = drawingManager.addListener('overlaycomplete', handleOverlayComplete);

      return () => {
        window.google.maps.event.removeListener(listener);
        drawingManager.setMap(null);
      };
    }
  }, [map, drawingMode, handleOverlayComplete]);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat: 33.5972, lng: 130.4181 }}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {overlays.map((overlay, index) => (
        overlay.type === google.maps.drawing.OverlayType.POLYGON ? (
          <Polygon key={index} path={(overlay.overlay as google.maps.Polygon).getPath()} options={overlay.options} />
        ) : overlay.type === google.maps.drawing.OverlayType.POLYLINE ? (
          <Polyline key={index} path={(overlay.overlay as google.maps.Polyline).getPath()} options={overlay.options} />
        ) : (
          <Marker key={index} position={(overlay.overlay as google.maps.Marker).getPosition()} options={overlay.options} />
        )
      ))}
    </GoogleMap>
  );
});


Map.displayName = "Map";

export default Map;
