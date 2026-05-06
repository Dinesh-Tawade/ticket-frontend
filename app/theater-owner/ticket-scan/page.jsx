'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { markTicketAsUsed } from "../../services/adminCommunication";
import {
  FaSpinner,
  FaQrcode,
  FaCheckCircle,
  FaTimesCircle,
  FaTicketAlt,
  FaUser,
  FaFilm,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaTimes,
  FaArrowLeft,
  FaInfoCircle,
  FaPrint,
  FaCamera,
  FaCheck,
  FaShare,
} from 'react-icons/fa';
import { MdEventSeat, MdQrCodeScanner } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';

// Extract Booking ID from QR data
const extractBookingId = (rawValue) => {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  if (trimmed.includes('|')) {
    return trimmed.split('|')[0];
  }
  return trimmed;
};

// ==================== QR SCANNER COMPONENT ====================
const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current && !scannerInstanceRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-scanner-container",
        { 
          fps: 10, 
          qrbox: { width: 280, height: 280 }, 
          aspectRatio: 1.0,
          showZoomSlider: false,
        },
        false
      );
      scanner.render(onScanSuccess, onScanError);
      scannerInstanceRef.current = scanner;
    }
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(console.error);
        scannerInstanceRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-scanner-container" ref={scannerRef} className="w-full h-full" />;
};

// ==================== SCAN OVERLAY ====================
const ScanOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-10">
    <div className="absolute inset-0 bg-black/70" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-80 h-80 rounded-3xl border-2 border-white/40 shadow-2xl" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-80 h-80">
        <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-4 border-l-4 border-purple-500 rounded-tl-2xl" />
        <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl" />
        <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl" />
        <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-4 border-r-4 border-purple-500 rounded-br-2xl" />
        <div className="absolute left-4 right-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan" />
      </div>
    </div>
    <div className="absolute bottom-32 left-0 right-0 text-center">
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
        <MdQrCodeScanner className="text-purple-400 text-xl" />
        <p className="text-white text-sm font-medium">Position QR code within frame</p>
      </div>
    </div>
  </div>
);

// ==================== LOADING OVERLAY ====================
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FaQrcode className="text-purple-500 text-2xl animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Verifying Ticket</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we validate...</p>
      </div>
    </div>
  </div>
);

// ==================== SUCCESS MODAL ====================
const SuccessModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-slide-up">
        {/* Success Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-400" />
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <FaCheck className="text-green-500 text-3xl" />
            </div>
          </div>
          <h2 className="text-white font-bold text-2xl">✓ Check-in Successful!</h2>
          <p className="text-green-100 text-sm mt-1">Ticket has been validated successfully</p>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4">
          {/* Booking ID */}
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Booking ID</p>
            <p className="font-mono text-lg font-bold text-gray-800">{ticket.bookingId}</p>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FaUser className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Customer Name</p>
              <p className="font-semibold text-gray-800">{ticket.customer?.name || 'Guest'}</p>
            </div>
          </div>

          {/* Movie Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FaFilm className="text-indigo-500 mb-1" />
              <p className="text-xs text-gray-500">Movie</p>
              <p className="font-semibold text-gray-800 text-sm">{ticket.movieName}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <GiTheater className="text-orange-500 mb-1" />
              <p className="text-xs text-gray-500">Theater</p>
              <p className="font-semibold text-gray-800 text-sm">{ticket.theater?.name || 'Main Hall'}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <FaCalendarAlt className="text-green-500 mb-1" />
              <p className="text-xs text-gray-500">Date & Time</p>
              <p className="font-semibold text-gray-800 text-sm">{formatDate(ticket.showDate)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <FaTicketAlt className="text-red-500 mb-1" />
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-bold text-gray-800 text-lg">₹{ticket.totalAmount}</p>
            </div>
          </div>

          {/* Seats */}
          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdEventSeat className="text-yellow-600" />
              <p className="text-xs text-gray-500 font-medium">Seat Numbers</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ticket.seats?.map((seat, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                  {seat.rowName}{seat.seatNumber}
                </span>
              ))}
            </div>
          </div>

          {/* Check-in Time */}
          <div className="text-center text-xs text-gray-400">
            Checked in at {new Date().toLocaleTimeString()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FaPrint /> Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <FaQrcode /> Scan Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ERROR MODAL ====================
const ErrorModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
    <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl transform transition-all animate-slide-up">
      {/* Error Header */}
      <div className="relative bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <FaTimesCircle className="text-red-500 text-3xl" />
          </div>
        </div>
        <h2 className="text-white font-bold text-2xl">✗ Invalid Ticket</h2>
        <p className="text-red-100 text-sm mt-1">Verification failed</p>
      </div>

      {/* Error Content */}
      <div className="p-6 text-center">
        <div className="bg-red-50 rounded-xl p-4 mb-6">
          <FaInfoCircle className="text-red-400 text-2xl mx-auto mb-2" />
          <p className="text-gray-700 text-sm leading-relaxed">
            {message || 'This ticket could not be verified. Please check the QR code and try again.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium hover:from-gray-800 hover:to-gray-900 transition flex items-center justify-center gap-2"
          >
            <FaCamera /> Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ==================== HEADER COMPONENT ====================
const Header = ({ onBack }) => (
  <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-8 pb-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
    <div className="flex items-center justify-between">
      <button 
        onClick={onBack} 
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
      >
        <FaArrowLeft size={18} />
      </button>
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center">
          <FaTicketAlt className="text-purple-400 text-lg" />
          <h1 className="text-xl font-bold text-white tracking-wide">Scan Ticket</h1>
        </div>
        <p className="text-white/50 text-xs mt-1">Quick check-in system</p>
      </div>
      <div className="w-10 opacity-0" />
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const TicketScanModule = () => {
  const [scannedTicket, setScannedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkInMutation = useMutation({
    mutationFn: (qrData) => markTicketAsUsed(extractBookingId(qrData)),
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      if (data.success && data.data) {
        setScannedTicket(data.data);
        setShowSuccess(true);
        toast.success('✓ Check-in Successful! Customer has been verified.', {
          icon: '🎫',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        setError(data.message || 'Check-in failed');
        setShowError(true);
        toast.error(data.message || 'Invalid ticket. Please try again.', {
          icon: '❌',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      const msg = error.response?.data?.message || error.message || 'Network error. Please try again.';
      setError(msg);
      setShowError(true);
      toast.error(msg, {
        icon: '⚠️',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    },
  });

  const handleScanSuccess = (text) => {
    if (!checkInMutation.isPending && !showSuccess && !showError && !isProcessing) {
      checkInMutation.mutate(text);
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setShowError(false);
    setScannedTicket(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleBack = () => window.history.back();

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
      <Header onBack={handleBack} />

      <div className="absolute inset-0">
        <QRScanner onScanSuccess={handleScanSuccess} onScanError={() => {}} />
        <ScanOverlay />
      </div>

      {isProcessing && <LoadingOverlay />}
      {showSuccess && <SuccessModal ticket={scannedTicket} onClose={handleReset} />}
      {showError && <ErrorModal message={error} onClose={handleReset} />}

      {/* Instruction Card at Bottom */}
      {!isProcessing && !showSuccess && !showError && (
        <div className="absolute bottom-6 left-4 right-4 z-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Camera Ready</span>
              </div>
              <span>•</span>
              <span>Auto-scan enabled</span>
              <span>•</span>
              <span>1 ticket = 1 check-in</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketScanModule;