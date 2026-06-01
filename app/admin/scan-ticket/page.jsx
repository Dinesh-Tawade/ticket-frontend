'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { markTicketAsUsed } from "../../services/adminCommunication";
import useTheme from "@/app/hooks/useTheme";
import {
  FaCamera,
  FaCheckCircle,
  FaPlay,
  FaQrcode,
  FaSpinner,
  FaStop,
  FaTimesCircle,
} from 'react-icons/fa';

const QR_READER_ID = "qr-reader";
const SCANNING_STATE = 2;

const getRawTicketErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  const responseData = error.response?.data;
  return (
    responseData?.message ||
    responseData?.error ||
    error.message ||
    "Unable to verify ticket."
  );
};

const getTicketErrorInfo = (error) => {
  const rawMessage = getRawTicketErrorMessage(error);
  const message = rawMessage.toLowerCase();

  if (message.includes("already verified") || message.includes("already used") || message.includes("already checked")) {
    return {
      title: "Ticket Already Verified",
      message: "This ticket has already been verified for entry.",
    };
  }

  if (message.includes("already booked")) {
    return {
      title: "Ticket Already Booked",
      message: "This ticket has already been booked.",
    };
  }

  if (message.includes("booking not found") || message.includes("invalid ticket") || message.includes("not found")) {
    return {
      title: "Invalid Ticket",
      message: "No valid booking was found for this QR code.",
    };
  }

  if (message.includes("payment pending")) {
    return {
      title: "Payment Pending",
      message: "Payment is still pending for this ticket.",
    };
  }

  if (message.includes("expired")) {
    return {
      title: "Show Expired",
      message: "This ticket belongs to a show date that has already passed.",
    };
  }

  if (message.includes("booking id is required") || message.includes("qr data is required")) {
    return {
      title: "Invalid QR Code",
      message: "This QR code does not contain a valid booking ID.",
    };
  }

  if (message.includes("request failed with status code")) {
    return {
      title: "Verification Failed",
      message: "Unable to verify this ticket. Please scan a valid ticket.",
    };
  }

  return {
    title: "Verification Failed",
    message: rawMessage || "Unable to verify this ticket. Please try again.",
  };
};

function TicketScanModule() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraLabel, setCameraLabel] = useState("");
  const [scannerStatus, setScannerStatus] = useState("idle");

  const scannerRef = useRef(null);
  const loadingRef = useRef(false);
  const mutationRef = useRef(null);
  const mountedRef = useRef(false);
  const startingRef = useRef(false);
  const stoppingRef = useRef(false);
  const scannerStatusRef = useRef("idle");

  const updateScannerStatus = useCallback((status) => {
    scannerStatusRef.current = status;
    if (mountedRef.current) {
      setScannerStatus(status);
    }
  }, []);

  const clearReaderDom = useCallback(() => {
    const readerElement = document.getElementById(QR_READER_ID);
    if (readerElement) {
      readerElement.innerHTML = "";
    }
  }, []);

  const stopScanner = useCallback(async ({ clear = true } = {}) => {
    const scanner = scannerRef.current;

    if (!scanner) {
      if (clear) {
        clearReaderDom();
      }
      updateScannerStatus("idle");
      return;
    }

    if (stoppingRef.current) {
      return;
    }

    stoppingRef.current = true;
    updateScannerStatus(scannerStatusRef.current === "verifying" ? "verifying" : "stopping");

    try {
      const state = scanner.getState?.();
      if (scanner.isScanning || state === SCANNING_STATE) {
        await scanner.stop();
      }
    } catch {
      // The camera can already be stopped during hot reload or quick remounts.
    } finally {
      if (clear) {
        try {
          scanner.clear();
        } catch {
          // Ignore cleanup races from the QR library.
        }
        scannerRef.current = null;
        clearReaderDom();
      }

      stoppingRef.current = false;
      if (scannerStatusRef.current !== "verifying") {
        updateScannerStatus("idle");
      }
    }
  }, [clearReaderDom, updateScannerStatus]);

  const mutation = useMutation({
    mutationFn: (qrData) => markTicketAsUsed(qrData.split('|')[0]),
    onSuccess: (data) => {
      loadingRef.current = false;
      setLoading(false);
      updateScannerStatus("idle");

      if (data.success) {
        setScannedData(data.data);
        setShowResult(true);
        toast.success('Ticket verified!');
      } else {
        const ticketError = getTicketErrorInfo(data.message || 'Invalid ticket');
        setError(ticketError);
        toast.error(ticketError.message);
      }
    },
    onError: (err) => {
      loadingRef.current = false;
      setLoading(false);
      updateScannerStatus("idle");
      const ticketError = getTicketErrorInfo(err);
      setError(ticketError);
      toast.error(ticketError.message);
    }
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopScanner({ clear: true });
    };
  }, [stopScanner]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    mutationRef.current = mutation;
  }, [mutation]);

  const startScanner = useCallback(async () => {
    if (startingRef.current || stoppingRef.current || scannerStatusRef.current === "scanning") {
      return;
    }

    const readerElement = document.getElementById(QR_READER_ID);
    if (!readerElement) {
      return;
    }

    startingRef.current = true;
    setCameraError("");
    updateScannerStatus("starting");

    try {
      await stopScanner({ clear: true });
      clearReaderDom();

      const scanner = new Html5Qrcode(QR_READER_ID, false);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      const preferredCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label)) || cameras[0];
      const cameraConfig = preferredCamera?.id ? preferredCamera.id : { facingMode: "environment" };

      setCameraLabel(preferredCamera?.label || "Default camera");

      await scanner.start(
        cameraConfig,
        {
          fps: 8,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.7777778,
        },
        async (decodedText) => {
          if (loadingRef.current || mutationRef.current?.isPending) {
            return;
          }

          loadingRef.current = true;
          setLoading(true);
          updateScannerStatus("verifying");
          await stopScanner({ clear: false });
          mutationRef.current?.mutate(decodedText);
        },
        () => {
          // No-op by design: "not found" is expected between frames and should not spam logs.
        }
      );

      updateScannerStatus("scanning");
    } catch (err) {
      const message = err?.message || "Unable to start camera. Check camera permission and try again.";
      setCameraError(message);
      toast.error('Camera could not start');
      await stopScanner({ clear: true });
      updateScannerStatus("idle");
    } finally {
      startingRef.current = false;
    }
  }, [clearReaderDom, stopScanner, updateScannerStatus]);

  const handleClose = () => {
    setShowResult(false);
    setScannedData(null);
    setError(null);
    startScanner();
  };

  const scannerStatusMeta = useMemo(() => {
    const meta = {
      idle: { label: "Ready", color: "#22c55e", text: "Camera is ready to start." },
      starting: { label: "Opening camera", color: "#3b82f6", text: "Requesting camera access." },
      scanning: { label: "Scanning", color: "#22c55e", text: "Place the QR code inside the frame." },
      stopping: { label: "Stopping", color: "#f97316", text: "Closing camera stream." },
      verifying: { label: "Verifying", color: "#3b82f6", text: "Checking ticket details." },
    };

    return meta[scannerStatus] || meta.idle;
  }, [scannerStatus]);

  const isScannerBusy = scannerStatus === "starting" || scannerStatus === "stopping" || loading;
  const isScanning = scannerStatus === "scanning";

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 sm:p-6" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Toaster position="top-center" />

      <style>{`
        #${QR_READER_ID} {
          border: 0 !important;
          color: var(--foreground);
          height: 100%;
          overflow: hidden;
          width: 100%;
        }

        #${QR_READER_ID} video {
          border-radius: 12px;
          height: 100% !important;
          object-fit: cover;
          width: 100% !important;
        }

        #${QR_READER_ID} canvas {
          display: none !important;
        }
      `}</style>

      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <FaQrcode className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Scan Ticket
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Position QR code in frame to verify ticket entry.
                </p>
              </div>
            </div>

            <div
              className="px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: scannerStatusMeta.color }} />
              {scannerStatusMeta.label}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--card-border)" }}>
            <div className="flex items-center gap-2">
              <FaQrcode className="text-blue-500 text-lg" />
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>QR Scanner</h2>
            </div>
            <button
              onClick={isScanning ? () => stopScanner({ clear: true }) : startScanner}
              disabled={isScannerBusy}
              className="h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isScanning ? "rgba(239, 68, 68, 0.12)" : "linear-gradient(135deg, #3b82f6, #4f46e5)",
                borderColor: isScanning ? "rgba(239, 68, 68, 0.3)" : "transparent",
                color: isScanning ? "#ef4444" : "#ffffff",
              }}
            >
              {isScannerBusy ? (
                <FaSpinner className="animate-spin" />
              ) : isScanning ? (
                <FaStop />
              ) : (
                <FaPlay />
              )}
              {isScannerBusy ? scannerStatusMeta.label : isScanning ? "Stop Scanner" : "Start Scanner"}
            </button>
          </div>
          <div className="p-4">
            <div
              className="relative min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden border"
              style={{ background: isDark ? "#0f172a" : "#f8fafc", borderColor: "var(--card-border)" }}
            >
              <div id={QR_READER_ID} className="absolute inset-0" />

              {!isScanning && scannerStatus !== "verifying" && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                      <FaCamera className="text-blue-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-black mb-2" style={{ color: "var(--foreground)" }}>
                      Camera inactive
                    </h3>
                    <p className="text-sm leading-6" style={{ color: "var(--foreground)", opacity: 0.65 }}>
                      Start the scanner when you are ready to verify a ticket.
                    </p>
                    {cameraError && (
                      <p className="mt-4 text-sm font-semibold text-red-500">
                        {cameraError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[250px] h-[250px] rounded-2xl border-2 border-blue-400 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]">
                    <div className="absolute left-4 right-4 top-1/2 h-px bg-blue-400/80 shadow-[0_0_16px_rgba(59,130,246,0.8)]" />
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl h-fit"
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <FaQrcode className="text-blue-500 text-xl" />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Verification Mode
          </h2>
          <p className="text-sm leading-6 mb-5" style={{ color: "var(--foreground)", opacity: 0.65 }}>
            Keep the QR code centered in the camera frame. The scanner stops after a read so each ticket is verified once.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl p-4 border" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                Status
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: scannerStatusMeta.color }} />
                {scannerStatusMeta.text}
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                Camera
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {cameraLabel || "Not started"}
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                Theme
              </div>
              <div className="text-sm font-semibold capitalize" style={{ color: "var(--foreground)" }}>
                {theme} mode
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
             style={{ background: "rgba(0, 0, 0, 0.7)" }}>
          <div className="text-center rounded-xl p-8 shadow-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <FaSpinner className="text-5xl animate-spin mx-auto mb-4 text-blue-500" />
            <p style={{ color: "var(--foreground)" }} className="font-semibold">Verifying ticket...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showResult && scannedData && !error && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             style={{ background: "rgba(0, 0, 0, 0.7)" }}>
          <div className="rounded-xl max-w-md w-full p-8 transition-all duration-300 shadow-xl"
               style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300"
                   style={{ background: "rgba(34, 197, 94, 0.15)", border: "2px solid rgba(34, 197, 94, 0.3)" }}>
                <FaCheckCircle className="w-10 h-10" style={{ color: "#22c55e" }} />
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight"
                  style={{ color: "#22c55e" }}>
                Success!
              </h2>
              <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Ticket verified successfully
              </p>

              <div className="rounded-xl p-4 mb-6 space-y-3 text-left"
                   style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>Booking ID</p>
                  <p className="font-mono font-bold text-sm mt-1" style={{ color: "var(--foreground)" }}>{scannedData.bookingId}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>Customer</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--foreground)" }}>{scannedData.customer?.name || 'Guest'}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>Movie</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--foreground)" }}>{scannedData.movieName}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.5 }}>Seats</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--foreground)" }}>{scannedData.seats?.map(s => `${s.rowName}${s.seatNumber}`).join(', ')}</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
              >
                Scan Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             style={{ background: "rgba(0, 0, 0, 0.7)" }}>
          <div className="rounded-xl max-w-md w-full p-8 transition-all duration-300 shadow-xl"
               style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300"
                   style={{ background: "rgba(239, 68, 68, 0.15)", border: "2px solid rgba(239, 68, 68, 0.3)" }}>
                <FaTimesCircle className="w-10 h-10" style={{ color: "#ef4444" }} />
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight"
                  style={{ color: "#ef4444" }}>
                {error.title}
              </h2>
              <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                {error.message}
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #4f46e5)" }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketScanModule;
