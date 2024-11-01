"use client"

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, DrawingManager, Polygon, Polyline, Marker } from '@react-google-maps/api';
import { useToast } from "@/components/ui/use-toast"

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 35.6762,
  lng: 139.6503,
};

type MapProps = {
  userType: 'municipality' | 'operator' | 'resident';
  drawingMode: google.maps.drawing.OverlayType | null;
  setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
};

type Overlay = {
  type: google.maps.drawing.OverlayType;
  overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker;
  options: google.maps.PolygonOptions | google.maps.PolylineOptions | google.maps.MarkerOptions;
};

const defaultPolygonOptions: google.maps.PolygonOptions = {
  fillColor: "#FF0000",
  fillOpacity: 0.35,
  strokeWeight: 2,
  clickable: true,
  editable: true,
  zIndex: 1,
};

const defaultPolylineOptions: google.maps.PolylineOptions = {
  strokeColor: "#0000FF",
  strokeWeight: 2,
  clickable: true,
  editable: true,
  zIndex: 1,
};

export default function Map({ userType, drawingMode, setDrawingMode }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const { toast } = useToast()

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map) {
      if (drawingManager) drawingManager.setMap(null);
      
      const newDrawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: drawingMode,
        drawingControl: false,
        polygonOptions: defaultPolygonOptions,
        polylineOptions: defaultPolylineOptions,
      });
      newDrawingManager.setMap(map);
      setDrawingManager(newDrawingManager);

      google.maps.event.addListener(newDrawingManager, 'overlaycomplete', handleOverlayComplete);
    }
  }, [map, drawingMode, userType]);

  const handleOverlayComplete = (event: google.maps.drawing.OverlayCompleteEvent) => {
    const newOverlay: Overlay = {
      type: event.type,
      overlay: event.overlay,
      options: event.type === google.maps.drawing.OverlayType.POLYGON
        ? defaultPolygonOptions
        : event.type === google.maps.drawing.OverlayType.POLYLINE
        ? defaultPolylineOptions
        : {} // For markers, we don't need specific options
    };

    setOverlays(prevOverlays => [...prevOverlays, newOverlay]);

    if (event.type === google.maps.drawing.OverlayType.POLYGON) {
      toast({
        title: "No-fly zone created",
        description: "A new no-fly zone has been added to the map.",
      })
    } else if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
      toast({
        title: "Flight path created",
        description: "A new flight path has been added to the map.",
      })
    } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
      toast({
        title: "Report submitted",
        description: "Your report has been submitted successfully.",
      })
    }
    setDrawingMode(null);
  };

  const clearOverlays = useCallback(() => {
    overlays.forEach(({ overlay }) => overlay.setMap(null));
    setOverlays([]);
    toast({
      title: "Cleared",
      description: "All overlays have been removed from the map.",
    })
  }, [overlays, toast]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {overlays.map((overlay, index) => {
        if (overlay.type === google.maps.drawing.OverlayType.POLYGON) {
          return (
            <Polygon
              key={`polygon-${index}`}
              path={(overlay.overlay as google.maps.Polygon).getPath()}
              options={overlay.options as google.maps.PolygonOptions}
            />
          );
        } else if (overlay.type === google.maps.drawing.OverlayType.POLYLINE) {
          return (
            <Polyline
              key={`polyline-${index}`}
              path={(overlay.overlay as google.maps.Polyline).getPath()}
              options={overlay.options as google.maps.PolylineOptions}
            />
          );
        } else if (overlay.type === google.maps.drawing.OverlayType.MARKER) {
          return (
            <Marker
              key={`marker-${index}`}
              position={(overlay.overlay as google.maps.Marker).getPosition()}
              options={overlay.options as google.maps.MarkerOptions}
            />
          );
        }
        return null;
      })}
    </GoogleMap>
  );
}