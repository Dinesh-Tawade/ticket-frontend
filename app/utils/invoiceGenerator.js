import { jsPDF } from "jspdf";
import autoTable, { applyPlugin } from "jspdf-autotable";

// Explicitly apply the plugin to the jsPDF class to guarantee compatibility
try {
  applyPlugin(jsPDF);
} catch (e) {
  console.warn("Could not manually apply jspdf-autotable plugin:", e);
}

/**
 * Generates and downloads a beautiful PDF invoice/receipt for a food order.
 * @param {Object} order - The order details from API.
 * @param {Object} [currentUser] - Optional fallback logged-in user details.
 */
export const generateInvoicePDF = (order, currentUser = null) => {
  const doc = new jsPDF();

  // Color Palette
  const colors = {
    primary: [79, 70, 229],     // Indigo #4F46E5
    textDark: [17, 24, 39],      // Gray 900
    textMuted: [100, 116, 139],  // Gray 500
    border: [226, 232, 240],     // Gray 200
  };

  // Header Branding
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("FOOD EXPRESS", 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text("Online Cinema Food Ordering Service", 14, 30);

  // Invoice Title Right-Aligned
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text("INVOICE / RECEIPT", 196, 25, { align: "right" });

  // Horizontal Divider Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(14, 35, 196, 35);

  // Metadata Details (Left and Right Columns)
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);

  // Left side - Store details
  const storeName = order.storeId?.storeName || "Food Store";
  const theaterName = order.theaterId?.name || "Cinema Theater";
  doc.text(`Fulfill Vendor: ${storeName}`, 14, 43);
  doc.text(`Theater Location: ${theaterName}`, 14, 49);

  // Right side - Order details
  const orderId = order.orderId || order._id?.slice(-6) || "N/A";
  const orderDate = new Date(order.orderedAt || order.createdAt || Date.now()).toLocaleString();
  doc.text(`Order ID: #${orderId}`, 196, 43, { align: "right" });
  doc.text(`Date: ${orderDate}`, 196, 49, { align: "right" });
  doc.text(`Status: ${order.orderStatus || "PENDING"}`, 196, 55, { align: "right" });

  // Divider
  doc.line(14, 60, 196, 60);

  // Customer & Delivery Info Section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text("BILL TO (CUSTOMER)", 14, 68);
  doc.text("DELIVERY INFO", 110, 68);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);

  const buyerName = order.buyerId?.name || currentUser?.name || "Theater Owner";
  const buyerPhone = order.buyerId?.phone || currentUser?.phone || "N/A";
  doc.text(`Customer Name: ${buyerName}`, 14, 75);
  doc.text(`Contact Phone: ${buyerPhone}`, 14, 81);

  const deliveryType = order.deliveryType?.replace("_", " ") || "SEAT DELIVERY";
  
  // Helper to extract seat numbers
  const extractSeatNumbers = (specialInstructions) => {
    if (!specialInstructions) return 'N/A';
    const match = specialInstructions.match(/seat\s+([A-Z0-9,\s]+)/i);
    return match ? match[1].trim() : specialInstructions;
  };
  const seatNumbers = extractSeatNumbers(order.specialInstructions);
  
  doc.text(`Delivery Mode: ${deliveryType}`, 110, 75);
  doc.text(`Seat Assigned: ${seatNumbers}`, 110, 81);

  // Items Table
  const tableColumn = ["Item Name", "Unit Price", "Quantity", "Total Amount"];
  const tableRows = [];

  (order.items || []).forEach(item => {
    const itemData = [
      item.productName || "Product Item",
      `INR ${item.price?.toFixed(2)}`,
      item.quantity || 1,
      `INR ${item.total?.toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: "striped",
    headStyles: { 
      fillColor: colors.primary, 
      textColor: [255, 255, 255],
      fontStyle: "bold" 
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 4,
      textColor: colors.textDark 
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "right" }
    },
    margin: { left: 14, right: 14 }
  });

  // Summary and Totals Block
  const finalY = doc.lastAutoTable.finalY + 12;

  // Subtotal calculations
  const subTotal = order.subTotal || order.totalAmount - (order.tax || 0) - (order.deliveryCharge || 0);
  const tax = order.tax || 0;
  const deliveryCharge = order.deliveryCharge || 0;
  const totalAmount = order.totalAmount || 0;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);

  doc.text("Payment Method:", 14, finalY);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(order.paymentMethod || "CASH ON DELIVERY", 42, finalY);

  // Summary values aligned right
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text("Subtotal:", 140, finalY);
  doc.text(`INR ${subTotal.toFixed(2)}`, 196, finalY, { align: "right" });

  doc.text("Tax (5% GST):", 140, finalY + 6);
  doc.text(`INR ${tax.toFixed(2)}`, 196, finalY + 6, { align: "right" });

  doc.text("Delivery Charge:", 140, finalY + 12);
  doc.text(`INR ${deliveryCharge.toFixed(2)}`, 196, finalY + 12, { align: "right" });

  // Double line for grand total
  doc.setLineWidth(0.3);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(135, finalY + 16, 196, finalY + 16);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Grand Total:", 140, finalY + 22);
  doc.text(`INR ${totalAmount.toFixed(2)}`, 196, finalY + 22, { align: "right" });

  // Page Border / Footer Accent
  doc.setLineWidth(1);
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.line(14, 275, 196, 275);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text("Thank you for ordering with Food Express! Enjoy your cinema experience.", doc.internal.pageSize.width / 2, 281, { align: "center" });

  // Save/Download PDF
  doc.save(`Invoice_Order_${orderId}.pdf`);
};
