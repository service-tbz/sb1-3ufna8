"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type HeaderProps = {
  userType: 'municipality' | 'operator' | 'resident';
  setUserType: (type: 'municipality' | 'operator' | 'resident') => void;
  drawingMode: google.maps.drawing.OverlayType | null;
  setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
  clearOverlays: () => void;
  isLoaded: boolean;
};

export function Header({ userType, setUserType, drawingMode, setDrawingMode, clearOverlays, isLoaded }: HeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">SkyArea10</h1>
        <div className="flex items-center space-x-4">
          <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="municipality">Municipality</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
              <SelectItem value="resident">Resident</SelectItem>
            </SelectContent>
          </Select>
          {isLoaded && userType !== 'resident' && (
            <>
              <Button
                variant={drawingMode === google.maps.drawing.OverlayType.POLYGON ? "secondary" : "outline"}
                onClick={() => setDrawingMode(google.maps.drawing.OverlayType.POLYGON)}
              >
                Draw {userType === 'municipality' ? 'No-Fly Zone' : 'Flight Path'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDrawingMode(null)}
              >
                Stop Drawing
              </Button>
              <Button
                variant="destructive"
                onClick={clearOverlays}
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}