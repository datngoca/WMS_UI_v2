import * as React from "react";
import {
  Camera,
  ScanBarcode,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PosScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  wsUrl?: string;
  title?: string;
  description?: string;
  preventCloseOnOutsideClick?: boolean;
};

export const PosScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Quét mã Barcode / QR",
  description = "Đưa mã vạch vào khung ngắm để tự động quét",
  preventCloseOnOutsideClick = true,
  wsUrl =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
        ? `wss://${window.location.host}/ws/scan`
        : window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ? `ws://${window.location.hostname}:8000/ws/scan`
        : "ws://localhost:8000/ws/scan"
      : "ws://localhost:8000/ws/scan",
}: PosScannerModalProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [wsConnected, setWsConnected] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [manualCode, setManualCode] = React.useState("");
  const [lastScannedCode, setLastScannedCode] = React.useState<string | null>(null);
  const [lastScanType, setLastScanType] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(true);

  // Play cashier scanner beep sound using Web Audio API
  const playBeep = React.useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context might fail without user gesture, safe to ignore
    }
  }, [soundEnabled]);

  const handleDetected = React.useCallback(
    (code: string, type?: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      playBeep();
      setLastScannedCode(trimmed);
      setLastScanType(type || "BARCODE");
      onScanSuccess(trimmed);

      // Temporary pause scanning to avoid multi-fire on same frame
      setIsScanning(false);
      setTimeout(() => {
        setIsScanning(true);
      }, 1200);
    },
    [onScanSuccess, playBeep],
  );

  // Initialize camera
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ camera API (HTTPS required)");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể truy cập camera";
      setCameraError(msg);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize WebSocket connection to FastAPI scanner
  const connectWebSocket = React.useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "SUCCESS" && data.code) {
            handleDetected(data.code, data.type);
          }
        } catch {
          // not json
        }
      };
    } catch {
      setWsConnected(false);
    }
  }, [handleDetected, wsUrl]);

  // Frame sender loop (grabs canvas frame as jpeg binary and sends to ws)
  React.useEffect(() => {
    if (!isOpen || !cameraActive || !wsConnected || !isScanning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ws = wsRef.current;

      if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob && ws.readyState === WebSocket.OPEN) {
            blob.arrayBuffer().then((buffer) => {
              ws.send(buffer);
            });
          }
        },
        "image/jpeg",
        0.7,
      );
    }, 220); // ~4.5 frames per second for smooth low-latency decoding

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, cameraActive, wsConnected, isScanning]);

  // Modal open / close lifecycle
  React.useEffect(() => {
    if (isOpen) {
      startCamera();
      connectWebSocket();
    } else {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setLastScannedCode(null);
    }

    return () => {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, startCamera, stopCamera, connectWebSocket]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetected(manualCode.trim(), "MANUAL");
    setManualCode("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          if (preventCloseOnOutsideClick) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (preventCloseOnOutsideClick) {
            e.preventDefault();
          }
        }}
        className="max-w-md w-[94vw] sm:w-full p-0 overflow-hidden rounded-2xl border-slate-200 touch-manipulation shadow-2xl"
      >
        <DialogHeader className="p-4 pb-2.5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 pr-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScanBarcode className="size-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <DialogTitle className="text-base font-bold text-slate-900 truncate">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 mr-7 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors cursor-pointer"
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-rose-500" />}
            </button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3">
          {/* Status Indicators */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              {wsConnected ? (
                <Badge variant="outline" className="text-[10px] gap-1 border-emerald-300 text-emerald-700 bg-emerald-50">
                  <Wifi className="size-3 text-emerald-600" />
                  Scanner Service: Đã kết nối
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] gap-1 border-slate-200 text-slate-500 bg-slate-50">
                  <WifiOff className="size-3 text-slate-400" />
                  Scanner Service: Chưa kết nối ({wsUrl})
                </Badge>
              )}
            </div>

            {!wsConnected && (
              <button
                type="button"
                onClick={connectWebSocket}
                className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                Thử lại
              </button>
            )}
          </div>

          {/* Fixed Height Camera Viewport Container */}
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner border border-slate-800 touch-none select-none">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              disablePictureInPicture
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            {/* Hidden canvas for grabbing frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Graphic */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-[220px] h-[160px] border-2 border-primary/70 rounded-xl shadow-lg shadow-primary/10 overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 size-4 border-t-3 border-l-3 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 size-4 border-t-3 border-r-3 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 size-4 border-b-3 border-l-3 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 size-4 border-b-3 border-r-3 border-emerald-400" />

                  {/* Animated red laser scanning bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-sm shadow-rose-500 animate-pulse translate-y-16" />
                </div>
              </div>
            )}

            {/* Scanned result HUD overlay - Inside camera viewport to prevent modal height jumping */}
            {lastScannedCode && (
              <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/90 backdrop-blur-md border border-emerald-500/60 text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <div className="text-xs truncate">
                    <span className="font-semibold text-emerald-300">Đã quét:</span>{" "}
                    <span className="font-mono font-bold">{lastScannedCode}</span>
                    {lastScanType && (
                      <span className="text-[10px] ml-1.5 text-emerald-400 font-medium">
                        ({lastScanType})
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-emerald-950 font-bold text-[10px] shrink-0 hover:bg-emerald-400">
                  Đã thêm
                </Badge>
              </div>
            )}

            {/* Error or Fallback State */}
            {cameraError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-slate-900/90 text-white gap-2">
                <AlertCircle className="size-8 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                <Button size="sm" variant="outline" onClick={startCamera} className="mt-2 text-xs text-white border-slate-700 bg-slate-800 hover:bg-slate-700">
                  <Camera className="size-3.5 mr-1" /> Thử lại camera
                </Button>
              </div>
            )}

            {!cameraActive && !cameraError && (
              <div className="text-center text-slate-400 text-xs">
                Đang khởi động máy ảnh...
              </div>
            )}
          </div>

          {/* Manual / Barcode Gun Input (Always works!) */}
          <form onSubmit={handleManualSubmit} className="pt-1">
            <div className="text-xs text-muted-foreground mb-1.5 font-medium">
              Hoặc dùng máy quét mã vạch USB / nhập tay:
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Quét mã vạch hoặc nhập mã SKU..."
                  className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-base sm:text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 px-3 text-xs font-medium cursor-pointer">
                Thêm
              </Button>
            </div>
          </form>
        </div>

        {/* Modal Footer with explicit close button */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Bấm "Đóng" hoặc nút ✕ góc trên để tắt
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-3.5 text-xs cursor-pointer hover:bg-slate-100"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
