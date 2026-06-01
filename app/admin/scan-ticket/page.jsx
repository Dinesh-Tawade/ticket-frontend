'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { markTicketAsUsed } from "../../services/adminCommunication";
import useTheme from "@/app/hooks/useTheme";
import { FaCheckCircle, FaQrcode, FaSpinner, FaTimesCircle } from 'react-icons/fa';

function TicketScanModule() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const loadingRef = useRef(false);
  const mutationRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (qrData) => markTicketAsUsed(qrData.split('|')[0]),
    onSuccess: (data) => {
      loadingRef.current = false;
      setLoading(false);
      if (data.success) {
        setScannedData(data.data);
        setShowResult(true);
        toast.success('Ticket verified!');
      } else {
        setError(data.message || 'Invalid ticket');
        toast.error('Invalid ticket');
      }
    },
    onError: (err) => {
      loadingRef.current = false;
      setLoading(false);
      setError(err.message);
      toast.error('Verification failed');
    }
  });

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    mutationRef.current = mutation;
  }, [mutation]);

  useEffect(() => {
    const readerElement = document.getElementById("qr-reader");

    if (!readerElement || scannerRef.current) {
      return;
    }

    readerElement.innerHTML = "";

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (text) => {
        if (!mutationRef.current?.isPending && !loadingRef.current) {
          loadingRef.current = true;
          setLoading(true);
          mutationRef.current?.mutate(text);
        }
      },
      (err) => console.log(err)
    );

    scannerRef.current = scanner;

    return () => {
      const currentScanner = scannerRef.current;
      scannerRef.current = null;

      if (currentScanner) {
        Promise.resolve(currentScanner.clear())
          .catch(() => {})
          .finally(() => {
            if (readerElement && !scannerRef.current) {
              readerElement.innerHTML = "";
            }
          });
      } else if (readerElement) {
        readerElement.innerHTML = "";
      }
    };
  }, []);

  const handleClose = () => {
    setShowResult(false);
    setScannedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 sm:p-6" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Toaster position="top-center" />

      <style>{`
        #qr-reader {
          border: 0 !important;
          color: var(--foreground);
          overflow: hidden;
        }

        #qr-reader video {
          border-radius: 12px;
        }

        #qr-reader__scan_region {
          background: ${isDark ? "#0f172a" : "#f8fafc"};
          border-radius: 12px;
          min-height: 320px;
        }

        #qr-reader__dashboard {
          padding: 16px !important;
          background: var(--card);
          border-top: 1px solid var(--card-border);
        }

        #qr-reader__dashboard button,
        #qr-reader__dashboard select {
          border-radius: 10px !important;
          border: 1px solid var(--card-border) !important;
          background: var(--background) !important;
          color: var(--foreground) !important;
          min-height: 34px;
          padding: 6px 10px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        #qr-reader a {
          color: #3b82f6 !important;
          font-size: 12px;
          font-weight: 600;
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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Scanner Ready
            </div>
          </div>
        </div>
      </div>

      {/* Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
             style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--card-border)" }}>
            <FaQrcode className="text-blue-500 text-lg" />
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>QR Scanner</h2>
          </div>
          <div className="p-4">
            <div id="qr-reader" className="w-full rounded-xl" style={{ background: isDark ? "#0f172a" : "#f8fafc" }}></div>
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
            Keep the QR code centered in the camera frame. Results will appear automatically after a successful scan.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl p-4 border" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                Status
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Ready to scan
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
                Error!
              </h2>
              <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                {error}
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
