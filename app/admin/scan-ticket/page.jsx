'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { markTicketAsUsed } from "../../services/adminCommunication";

function TicketScanModule() {
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (qrData) => markTicketAsUsed(qrData.split('|')[0]),
    onSuccess: (data) => {
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
      setLoading(false);
      setError(err.message);
      toast.error('Verification failed');
    }
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (text) => {
        if (!mutation.isPending && !loading) {
          setLoading(true);
          mutation.mutate(text);
        }
      },
      (err) => console.log(err)
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleClose = () => {
    setShowResult(false);
    setScannedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
        <h1 className="text-xl font-bold text-center">Scan Ticket</h1>
        <p className="text-sm text-center text-purple-200">Position QR code in frame</p>
      </div>

      {/* Scanner */}
      <div className="p-4">
        <div id="qr-reader" className="w-full rounded-xl overflow-hidden shadow-lg"></div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Verifying ticket...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showResult && scannedData && !error && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">Ticket verified successfully</p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-mono font-bold mb-2">{scannedData.bookingId}</p>
                
                <p className="text-sm text-gray-500 mt-2">Customer</p>
                <p className="font-semibold">{scannedData.customer?.name || 'Guest'}</p>
                
                <p className="text-sm text-gray-500 mt-2">Movie</p>
                <p className="font-semibold">{scannedData.movieName}</p>
                
                <p className="text-sm text-gray-500 mt-2">Seats</p>
                <p className="font-semibold">{scannedData.seats?.map(s => `${s.rowName}${s.seatNumber}`).join(', ')}</p>
              </div>
              
              <button
                onClick={handleClose}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
              >
                Scan Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error!</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
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