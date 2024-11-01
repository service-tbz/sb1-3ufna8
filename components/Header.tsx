"use client"

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type HeaderProps = {
  userType: 'municipality' | 'operator' | 'resident';
  setUserType: (type: 'municipality' | 'operator' | 'resident') => void;
  drawingMode: google.maps.drawing.OverlayType | null;
  setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
  isLoaded: boolean;
  onClearOverlays: () => void;
  warning: string | null;
};

export function Header({ userType, setUserType, drawingMode, setDrawingMode, isLoaded, onClearOverlays, warning }: HeaderProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClearAll = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    onClearOverlays();
    setShowConfirmDialog(false);
  };

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">SkyArea10</h1>

        <div className="flex items-center space-x-4">
          <style jsx global>{`
            @keyframes slow-ping {
              75%, 100% {
                transform: scale(2);
                opacity: 0;
              }
            }
            .animate-slow-ping {
              animation: slow-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
          `}</style>

          <div className={`
            transition-all duration-200 ease-in-out
            px-3 py-1.5 rounded-full text-sm font-medium
            flex items-center gap-2
            ${drawingMode 
              ? 'bg-primary-foreground text-primary'
              : 'bg-green-100 text-green-800 border border-green-300'}
          `}>
            {drawingMode ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full bg-red-500 rounded-full opacity-75 animate-slow-ping"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"/>
                </span>
                {userType === 'municipality' 
                  ? '禁止区域描画'
                  : userType === 'operator'
                    ? '経路描画'
                    : 'マーカー配置'}
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"/>
                操作モード
              </>
            )}
          </div>

          <Select value={userType} onValueChange={(value: 'municipality' | 'operator' | 'resident') => setUserType(value)}>
            <SelectTrigger className="w-[180px] text-black">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="municipality">Municipality</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
              <SelectItem value="resident">Resident</SelectItem>
            </SelectContent>
          </Select>

          {isLoaded && (userType === 'municipality' || userType === 'operator') && (
            <>
              <Button
                variant={
                  drawingMode === (userType === 'municipality' 
                    ? google.maps.drawing.OverlayType.POLYGON 
                    : google.maps.drawing.OverlayType.POLYLINE)
                    ? "secondary" 
                    : "outline"
                }
                onClick={() => setDrawingMode(
                  userType === 'municipality' 
                    ? google.maps.drawing.OverlayType.POLYGON 
                    : google.maps.drawing.OverlayType.POLYLINE
                )}
              >
                Draw {userType === 'municipality' ? 'No-Fly Zone' : 'Flight Path'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setDrawingMode(null)}
              >
                Stop Drawing
              </Button>
            </>
          )}

          {isLoaded && userType === 'resident' && (
            <>
              <Button
                variant={drawingMode === google.maps.drawing.OverlayType.MARKER ? "secondary" : "outline"}
                onClick={() => setDrawingMode(google.maps.drawing.OverlayType.MARKER)}
              >
                Put Marker
              </Button>
              <Button
                variant="outline"
                onClick={() => setDrawingMode(null)}
              >
                Stop Drawing
              </Button>
            </>
          )}

          {isLoaded && (
            <>
              <Button
                variant="destructive"
                onClick={handleClearAll}
              >
                Clear All
              </Button>

              {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">全ての要素を削除</h3>
                    <p className="text-gray-600 mb-6">全ての描画された要素を削除しますか？<br/>この操作は取り消せません。</p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmDialog(false)}
                      >
                        キャンセル
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleConfirm}
                      >
                        削除する
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        {warning && (
          <div className="bg-red-500 text-white text-center py-2">
            {warning}
          </div>
        )}
        {!warning && (
          <div className="bg-green-500 text-white text-center py-2">
            <span>✔️ 経路は安全です</span>
          </div>
        )}
      </div>
    </header>
  );
}

