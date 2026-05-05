'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyTicket, markTicketAsUsed } from "../../services/adminCommunication";
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
  FaPrint,
  FaCheckDouble,
  FaArrowLeft,
  FaSync,
  FaInfoCircle,
  FaCamera,
  FaVideo,
} from 'react-icons/fa';
import { MdQrCodeScanner, MdEventSeat } from 'react-icons/md';
import { GiTheater } from 'react-icons/gi';

// ==================== STAT CARD ====================
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    purple: "from-purple-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-500 to-amber-600",
    blue: "from-blue-500 to-cyan-600",
  };
  
  return (
    <div className="rounded-xl p-3 text-center transition-all duration-300 hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
        <Icon className="text-white text-sm" />
      </div>
      <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</p>
    </div>
  );
};

// ==================== TICKET DETAILS MODAL ====================
const TicketDetailsModal = ({ ticket, onClose, onCheckIn, isCheckingIn }) => {
  if (!ticket) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusConfig = (status) => {
    switch(status) {
      case 'PAID': return { color: 'text-green-500', bg: 'bg-green-500/10', text: 'Paid' };
      case 'PENDING': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', text: 'Pending' };
      case 'FREE': return { color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'Free' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', text: status };
    }
  };

  const paymentConfig = getPaymentStatusConfig(ticket.paymentStatus);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 p-5 border-b flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaTicketAlt className="text-purple-500" /> Ticket Details
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>{ticket.bookingId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer Info */}
          <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaUser className="text-purple-500" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Name</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{ticket.customer?.name || ticket.user?.name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Email</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{ticket.customer?.email || ticket.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Phone</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{ticket.customer?.phone || ticket.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Show Info */}
          <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <FaFilm className="text-purple-500" /> Show Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Movie</p>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{ticket.movieName || ticket.show?.movie?.name}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Theater</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{ticket.theater?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Date</p>
                <p className="text-sm flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-400 text-xs" />
                  {formatDate(ticket.showDate)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Time</p>
                <p className="text-sm flex items-center gap-2">
                  <FaClock className="text-purple-400 text-xs" />
                  {ticket.showTime}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Screen</p>
                <p className="text-sm">Screen {ticket.screenNumber || 1}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Payment</p>
                <div className={`inline-flex px-2 py-0.5 rounded-full text-xs ${paymentConfig.bg} ${paymentConfig.color}`}>
                  {paymentConfig.text}
                </div>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <MdEventSeat className="text-purple-500" /> Booked Seats ({ticket.seats?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {ticket.seats?.map((seat, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono font-medium"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                >
                  {seat.rowName}{seat.seatNumber}
                  <span className="text-xs ml-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                    ({seat.category})
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: "var(--card-border)" }}>
              <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Amount</span>
              <div className="flex items-center gap-1">
                <FaRupeeSign className="text-green-500 text-sm" />
                <span className="text-xl font-bold text-green-500">₹{ticket.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Check-in Action */}
          <div className={`p-4 rounded-xl ${ticket.isCheckedIn ? 'bg-green-500/10 border border-green-500/20' : 'bg-purple-500/10 border border-purple-500/20'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Check-in Status</p>
                <p className={`font-semibold ${ticket.isCheckedIn ? 'text-green-500' : 'text-purple-500'}`}>
                  {ticket.isCheckedIn ? '✓ Already Checked In' : '⏳ Pending Check-in'}
                </p>
              </div>
              {!ticket.isCheckedIn && (
                <button
                  onClick={() => onCheckIn(ticket.bookingId)}
                  disabled={isCheckingIn}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCheckingIn ? (
                    <><FaSpinner className="animate-spin" /> Processing...</>
                  ) : (
                    <><FaCheckDouble /> Check-in Now</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== QR SCANNER COMPONENT ====================
const QRScanner = ({ onScanSuccess, onScanError, isScanning }) => {
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    // Initialize scanner
    if (scannerRef.current && !scannerInstanceRef.current) {
      const html5QrCodeScanner = new Html5QrcodeScanner(
        "qr-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      );

      html5QrCodeScanner.render(onScanSuccess, onScanError);
      scannerInstanceRef.current = html5QrCodeScanner;
    }

    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(error => {
          console.error("Failed to clear scanner:", error);
        });
        scannerInstanceRef.current = null;
      }
    };
  }, [isScanning, onScanSuccess, onScanError]);

  if (!isScanning) return null;

  return (
    <div className="w-full">
      <div id="qr-scanner-container" ref={scannerRef} className="w-full"></div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const TicketScanModule = () => {
  const queryClient = useQueryClient();
  const [isCameraMode, setIsCameraMode] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [cameraError, setCameraError] = useState(null);

  // Load recent scans from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      try {
        setRecentScans(JSON.parse(saved).slice(0, 5));
      } catch (e) {}
    }
  }, []);

  // Save recent scan
  const saveRecentScan = (ticket) => {
    const newScan = {
      id: ticket.bookingId,
      name: ticket.customer?.name || ticket.user?.name || 'Guest',
      timestamp: new Date().toISOString(),
    };
    const updated = [newScan, ...recentScans.filter(s => s.id !== ticket.bookingId)].slice(0, 5);
    setRecentScans(updated);
    localStorage.setItem('recentScans', JSON.stringify(updated));
  };

  // Verify ticket mutation
  const verifyMutation = useMutation({
    mutationFn: (qrCode) => verifyTicket(qrCode),
    onSuccess: (data) => {
      setScanning(false);
      if (data.isValid && data.data) {
        setVerifiedTicket(data.data);
        setShowModal(true);
        saveRecentScan(data.data);
        toast.success('✓ Ticket Verified Successfully!', {
          icon: '🎫',
          duration: 2000,
        });
      } else {
        toast.error(data.message || 'Invalid ticket', {
          icon: '❌',
          duration: 3000,
        });
        setVerifiedTicket(null);
      }
    },
    onError: (error) => {
      setScanning(false);
      toast.error(error.response?.data?.message || 'Verification failed', {
        icon: '⚠️',
        duration: 3000,
      });
      setVerifiedTicket(null);
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (bookingId) => markTicketAsUsed(bookingId),
    onSuccess: () => {
      toast.success('✓ Check-in Successful!', {
        icon: '✅',
        duration: 2000,
      });
      setShowModal(false);
      setVerifiedTicket(null);
      queryClient.invalidateQueries(['my-bookings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Check-in failed', {
        icon: '❌',
        duration: 3000,
      });
    },
  });

  const handleScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Scanned:', decodedText);
    setScanning(true);
    verifyMutation.mutate(decodedText);
  };

  const handleScanError = (err) => {
    console.warn('QR Scan Error:', err);
    setCameraError('Camera access failed. Please check permissions.');
  };

  const handleCheckIn = (bookingId) => {
    checkInMutation.mutate(bookingId);
  };

  const handleReset = () => {
    setVerifiedTicket(null);
    setShowModal(false);
    setCameraError(null);
    // Restart scanner
    setScanning(false);
    setTimeout(() => {
      setScanning(true);
    }, 100);
  };

  const startCamera = () => {
    setCameraError(null);
    setScanning(true);
  };

  const stopCamera = () => {
    setScanning(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: "var(--foreground)" }}>
              <MdQrCodeScanner className="text-purple-500 text-3xl" />
              Ticket Scanner
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Scan QR code from customer's ticket to verify and check-in
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-2">
            <StatCard label="Today's Scans" value={recentScans.length} icon={FaQrcode} color="purple" />
            <StatCard label="Verified" value={verifyMutation.isSuccess ? 1 : 0} icon={FaCheckCircle} color="green" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {!showModal ? (
          <>
            {/* Camera Toggle */}
            <div className="flex justify-center gap-3 mb-6">
              <button
                onClick={() => {
                  setIsCameraMode(true);
                  startCamera();
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isCameraMode ? 'bg-purple-500 text-white' : ''}`}
                style={!isCameraMode ? { background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" } : {}}
              >
                <FaCamera /> Camera Mode
              </button>
              <button
                onClick={() => {
                  setIsCameraMode(false);
                  stopCamera();
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${!isCameraMode ? 'bg-purple-500 text-white' : ''}`}
                style={isCameraMode ? { background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" } : {}}
              >
                <FaVideo /> Manual Mode
              </button>
            </div>

            {/* QR Scanner Card */}
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaQrcode className="text-purple-500" />
                  {isCameraMode ? 'Scan QR Code with Camera' : 'Enter QR Code Manually'}
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {isCameraMode 
                    ? 'Position the QR code in front of the camera' 
                    : 'Paste the QR code from customer\'s ticket'}
                </p>
              </div>
              
              <div className="p-5">
                {isCameraMode ? (
                  // Camera Mode
                  <div className="space-y-4">
                    {cameraError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {cameraError}
                        <button 
                          onClick={startCamera}
                          className="ml-3 underline"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                    
                    <QRScanner 
                      onScanSuccess={handleScanSuccess}
                      onScanError={handleScanError}
                      isScanning={true}
                    />
                    
                    <div className="text-center p-4 rounded-xl" style={{ background: "var(--background)" }}>
                      <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                        📸 Point camera at the QR code on customer's ticket
                      </p>
                      <p className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                        Make sure the QR code is well-lit and clearly visible
                      </p>
                    </div>
                  </div>
                ) : (
                  // Manual Input Mode
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={verifyMutation.variables || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            verifyMutation.mutate(e.target.value);
                          }
                        }}
                        placeholder="Paste QR code data here..."
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none"
                        style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) {
                              verifyMutation.mutate(text);
                            }
                          } catch (err) {
                            toast.error('Unable to paste from clipboard');
                          }
                        }}
                        className="flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                      >
                        <FaQrcode /> Paste from Clipboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                  <FaInfoCircle className="text-purple-400" />
                  How to Scan
                </h3>
                <ul className="text-xs space-y-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">1.</span>
                    Ask customer to show their ticket QR code
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">2.</span>
                    Hold the phone steady in front of the QR code
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">3.</span>
                    Wait for automatic verification
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">4.</span>
                    Click "Check-in Now" to complete entry
                  </li>
                </ul>
              </div>

              {/* Recent Scans */}
              {recentScans.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <FaSync className="text-purple-400 text-xs" />
                    Recently Scanned
                  </h3>
                  <div className="space-y-2">
                    {recentScans.map((scan, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background: "var(--background)" }}>
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-purple-400 text-xs" />
                          <span className="font-mono">{scan.id.slice(-12)}</span>
                          <span className="opacity-50">•</span>
                          <span>{scan.name}</span>
                        </div>
                        <span className="text-xs opacity-50">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Format Example */}
            <div className="mt-4 rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                <span className="font-semibold">QR Code Format Example:</span> BKG1777807619193|B|7|B7
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                Format: BookingID|Row|SeatNumber|RowSeatNumber
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        ticket={verifiedTicket}
        onClose={handleReset}
        onCheckIn={handleCheckIn}
        isCheckingIn={checkInMutation.isPending}
      />

      {/* Scanning Overlay */}
      {verifyMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: "var(--card)" }}>
            <FaSpinner className="animate-spin text-3xl text-purple-500" />
            <p style={{ color: "var(--foreground)" }}>Verifying ticket...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketScanModule;