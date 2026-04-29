import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate QR code as data URL
export const generateQRCode = async (bookingData) => {
  try {
    const qrData = JSON.stringify({
      bookingId: bookingData.bookingId,
      movieName: bookingData.movieName,
      showDate: bookingData.showDate,
      showTime: bookingData.showTime,
      theaterName: bookingData.theaterName,
      seats: bookingData.seats.map(s => `${s.rowName}${s.seatNumber}`).join(', '),
      totalAmount: bookingData.totalAmount
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return null;
  }
};

// Generate PDF Ticket (A4 Size: 210mm x 297mm, 150x80cm is 1500x800mm but we'll use standard A4)
export const generateTicketPDF = async (bookingData, showDetails) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210mm x 297mm
  });
  
  const qrCode = await generateQRCode(bookingData);
  
  // Page setup for 150x80cm equivalent (scaled to A4)
  // We'll use multiple pages if needed for 40 seats
  
  const seatsPerPage = 20; // 20 seats per page
  const totalPages = Math.ceil(bookingData.seats.length / seatsPerPage);
  
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage();
    }
    
    const startSeat = page * seatsPerPage;
    const endSeat = Math.min(startSeat + seatsPerPage, bookingData.seats.length);
    const pageSeats = bookingData.seats.slice(startSeat, endSeat);
    
    // Border
    doc.setDrawColor(220, 220, 220);
    doc.rect(10, 10, 190, 277);
    
    // Header with gradient effect
    doc.setFillColor(220, 38, 38); // Red color
    doc.rect(10, 10, 190, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MOVIE TICKET', 105, 35, { align: 'center' });
    
    // Movie Poster (if available)
    if (showDetails.movie?.poster) {
      try {
        // Fetch and add poster image (scaled)
        const imgData = await getImageDataURL(showDetails.movie.poster);
        doc.addImage(imgData, 'JPEG', 15, 55, 50, 70);
      } catch (error) {
        // Fallback - draw placeholder
        doc.setFillColor(200, 200, 200);
        doc.rect(15, 55, 50, 70, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text('No Poster', 40, 90, { align: 'center' });
      }
    }
    
    // Movie Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(bookingData.movieName, 75, 70);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Theater Info
    doc.setTextColor(100, 100, 100);
    doc.text('🎭 THEATER', 75, 85);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(bookingData.theaterName, 75, 93);
    
    // Show Date & Time
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('📅 DATE & TIME', 75, 108);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${bookingData.showDate} | ${bookingData.showTime}`, 75, 116);
    
    // Seats Section
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('💺 SEATS', 15, 140);
    
    // Create seats table
    const seatRows = pageSeats.map((seat, idx) => [
      idx + 1 + startSeat,
      seat.rowName,
      seat.seatNumber,
      seat.category || 'NORMAL',
      `₹${seat.price || 0}`
    ]);
    
    doc.autoTable({
      startY: 148,
      head: [['#', 'Row', 'Seat', 'Category', 'Price']],
      body: seatRows,
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 }
      },
      margin: { left: 15, right: 15 }
    });
    
    const finalY = doc.lastAutoTable.finalY || 200;
    
    // Total Amount
    if (page === totalPages - 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, finalY + 5, 180, 25, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`Total Amount: ₹${bookingData.totalAmount}`, 180, finalY + 22, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Booking ID: ${bookingData.bookingId}`, 15, finalY + 22);
    }
    
    // QR Code (bottom right)
    if (qrCode && page === totalPages - 1) {
      doc.addImage(qrCode, 'PNG', 155, finalY + 5, 35, 35);
    }
    
    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 275, 195, 275);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Show this ticket at the theater entrance | Valid for one entry only', 105, 285, { align: 'center' });
  }
  
  // Save PDF
  doc.save(`Ticket_${bookingData.bookingId}.pdf`);
  return doc;
};

// Helper function to convert image URL to DataURL
const getImageDataURL = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    return null;
  }
};

// Generate HTML version for web view
export const generateTicketHTML = (bookingData, showDetails, qrCodeUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .ticket {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ticket-header {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .ticket-header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .ticket-header p {
          opacity: 0.9;
        }
        .ticket-content {
          padding: 30px;
        }
        .movie-info {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px dashed #e5e7eb;
        }
        .movie-poster {
          width: 120px;
          height: 160px;
          object-fit: cover;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .movie-details {
          flex: 1;
        }
        .movie-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
        }
        .info-label {
          width: 100px;
          font-weight: 600;
          color: #6b7280;
        }
        .info-value {
          flex: 1;
          color: #1f2937;
          font-weight: 500;
        }
        .seats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin: 20px 0;
        }
        .seat-card {
          background: #f3f4f6;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          border-left: 3px solid #dc2626;
        }
        .seat-number {
          font-weight: bold;
          font-size: 16px;
          color: #1f2937;
        }
        .seat-category {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
        }
        .total-amount {
          background: #fef3c7;
          padding: 15px;
          border-radius: 10px;
          text-align: right;
          margin: 20px 0;
          font-size: 18px;
          font-weight: bold;
          color: #92400e;
        }
        .qr-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px dashed #e5e7eb;
        }
        .qr-code {
          width: 120px;
          height: 120px;
        }
        .booking-id {
          font-family: monospace;
          font-size: 12px;
          color: #6b7280;
        }
        .footer {
          background: #f9fafb;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="ticket-header">
          <h1>🎬 MOVIE TICKET</h1>
          <p>Valid for one entry only</p>
        </div>
        <div class="ticket-content">
          <div class="movie-info">
            ${showDetails.movie?.poster ? `<img src="${showDetails.movie.poster}" class="movie-poster" alt="Movie Poster">` : '<div class="movie-poster" style="background:#e5e7eb; display:flex; align-items:center; justify-content:center;">No Poster</div>'}
            <div class="movie-details">
              <div class="movie-title">${bookingData.movieName}</div>
              <div class="info-row">
                <div class="info-label">Theater:</div>
                <div class="info-value">${bookingData.theaterName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">${bookingData.showDate}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Time:</div>
                <div class="info-value">${bookingData.showTime}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Genre:</div>
                <div class="info-value">${showDetails.movie?.genre || 'N/A'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Language:</div>
                <div class="info-value">${showDetails.movie?.language || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <h3 style="margin-bottom: 15px;">🎫 Booked Seats (${bookingData.seats.length})</h3>
          <div class="seats-grid">
            ${bookingData.seats.map(seat => `
              <div class="seat-card">
                <div class="seat-number">${seat.rowName}${seat.seatNumber}</div>
                <div class="seat-category">${seat.category || 'NORMAL'} | ₹${seat.price || 0}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="total-amount">
            Total Amount: ₹${bookingData.totalAmount}
          </div>
          
          <div class="qr-section">
            <div>
              <div class="booking-id">Booking ID: ${bookingData.bookingId}</div>
              <div class="booking-id" style="margin-top: 5px;">Scan QR at entrance</div>
            </div>
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-code" alt="QR Code">` : '<div class="qr-code" style="background:#e5e7eb;"></div>'}
          </div>
        </div>
        <div class="footer">
          Please reach theater 15 minutes before show time | This ticket is non-refundable
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;" class="no-print">
        <button onclick="window.print()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; margin: 0 10px; cursor: pointer;">🖨️ Print Ticket</button>
        <button onclick="window.close()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; margin: 0 10px; cursor: pointer;">Close</button>
      </div>
    </body>
    </html>
  `;
};