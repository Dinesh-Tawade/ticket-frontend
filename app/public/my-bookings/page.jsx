


"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Foods from "../food/Foods";
import { getMyBookings, cancelBooking } from "@/app/services/publicCommunication";
import {
  FaTicketAlt, FaCalendarAlt, FaClock, FaChair,
  FaMapMarkerAlt, FaTimes, FaCheckCircle, FaHourglassHalf,
  FaBan, FaDownload, FaFilm, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import Header from "@/app/components/public/Header";
import Footer from "@/app/components/public/Footer";
import AuthModal from "@/app/components/public/AuthModal";

/* ────────────────────────────────────────────────────────────────
   SINGLE TICKET STUB (one per seat)
──────────────────────────────────────────────────────────────── */
const SingleTicket = React.forwardRef(({ booking, seat, showDate }, ref) => {
  const category = seat?.category || booking.seats?.[0]?.category || "EXECUTIVE";
  const seatLabel = `${seat?.rowName || "—"}${seat?.seatNumber || "—"}`;

  return (
    <div className="st-ticket" ref={ref}>
      {/* LEFT */}
      <div className="st-left">
        <div className="st-movie">{booking.movieName}</div>
        <span className="st-cat">{category}</span>
        <div className="st-sep" />
        <div className="st-row">
          <span className="st-ico">📅</span>
          <div>
            <div className="st-lbl">Date</div>
            <div className="st-val">{showDate}</div>
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🕐</span>
          <div>
            <div className="st-lbl">Time</div>
            <div className="st-val">{booking.showTime}</div>
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🏛️</span>
          <div>
            <div className="st-lbl">Theater</div>
            <div className="st-val">{booking.theaterId?.name || "Anant Vijay Auditorium"}</div>
            {booking.theaterId?.address && <div className="st-sub">{booking.theaterId.address}</div>}
          </div>
        </div>
        <div className="st-row">
          <span className="st-ico">🎬</span>
          <div>
            <div className="st-lbl">Screen</div>
            <div className="st-val">{booking.screen || "Screen 1"}</div>
          </div>
        </div>
        <div className="st-sep" />
        <div className="st-footer">
          <div className="st-box-wrap">
            <div className="st-box-lbl">ROW</div>
            <div className="st-box">{seat?.rowName || "—"}</div>
          </div>
          <div className="st-box-wrap">
            <div className="st-box-lbl">SEAT</div>
            <div className="st-box">{seat?.seatNumber || "—"}</div>
          </div>
          <div className="st-box-wrap">
            <div className="st-box-lbl">PRICE</div>
            <div className="st-price">₹{seat?.price ?? booking.totalAmount}</div>
          </div>
        </div>
      </div>

      {/* PERF */}
      <div className="st-perf">
        <div className="st-perf-dot st-perf-dot--t" />
        <div className="st-perf-line" />
        <div className="st-perf-dot st-perf-dot--b" />
      </div>

      {/* RIGHT */}
      <div className="st-right">
        <div className="st-bkid">{booking.bookingId}</div>
        <div className="st-qr-wrap">
          <div className="st-qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${booking.bookingId}|${seat?.rowName || ''}|${seat?.seatNumber || ''}|${seatLabel}`)}&bgcolor=ffffff&color=000000`}
              alt="QR Code"
              className="w-full h-full"
            />
          </div>
          <div className="st-scan">SCAN TO VERIFY</div>
        </div>
        <div className="st-circle">{seatLabel}</div>
      </div>
    </div>
  );
});
SingleTicket.displayName = "SingleTicket";

/* ────────────────────────────────────────────────────────────────
   TICKET MODAL  — carousel, one ticket per seat
──────────────────────────────────────────────────────────────── */
const TicketModal = ({ booking, onClose }) => {
  const seats = booking.seats?.length ? booking.seats : [{}];
  const [idx, setIdx] = useState(0);
  const ticketRef = useRef(null);

  const showDate = new Date(booking.showDate).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  const capture = async () => {
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(ticketRef.current, {
      scale: 3, backgroundColor: "#ffffff", useCORS: true, logging: false,
    });
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await capture(idx);
      const link = document.createElement("a");
      link.download = `ticket-${booking.bookingId}-seat${idx + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { window.print(); }
  };

  const handleDownloadAll = async () => {
    try {
      for (let i = 0; i < seats.length; i++) {
        setIdx(i);
        await new Promise(r => setTimeout(r, 350));
        if (!ticketRef.current) continue;
        const canvas = await capture(i);
        const link = document.createElement("a");
        link.download = `ticket-${booking.bookingId}-seat${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise(r => setTimeout(r, 200));
      }
    } catch { window.print(); }
  };

  return (
    <div className="tm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tm-wrap">

        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-l">
            <h2 className="tm-title">Your Ticket</h2>
            {seats.length > 1 && (
              <span className="tm-counter">{idx + 1} / {seats.length} seats</span>
            )}
          </div>
          <button className="tm-x" onClick={onClose}><FaTimes size={15} /></button>
        </div>

        {/* Carousel */}
        <div className="tm-carousel">
          {seats.length > 1 && (
            <button className="tm-nav" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
              <FaChevronLeft size={13} />
            </button>
          )}
          <SingleTicket ref={ticketRef} booking={booking} seat={seats[idx]} showDate={showDate} />
          {seats.length > 1 && (
            <button className="tm-nav" onClick={() => setIdx(i => Math.min(seats.length - 1, i + 1))} disabled={idx === seats.length - 1}>
              <FaChevronRight size={13} />
            </button>
          )}
        </div>

        {/* Seat dots */}
        {seats.length > 1 && (
          <div className="tm-dots">
            {seats.map((_, i) => (
              <button key={i} className={`tm-dot ${i === idx ? "tm-dot--on" : ""}`} onClick={() => setIdx(i)} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="tm-actions">
          <button className="tm-btn-primary" onClick={handleDownload}>
            <FaDownload size={13} /> Download This Ticket
          </button>
          {seats.length > 1 && (
            <button className="tm-btn-secondary" onClick={handleDownloadAll}>
              <FaDownload size={13} /> All {seats.length} Tickets
            </button>
          )}
          <button className="tm-btn-ghost" onClick={onClose}>
            <FaTimes size={13} /> Close
          </button>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────── */
const MyBookingsPage = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("ALL");
  const [showAuthModal, setShowAuthModal] = useState(true);
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasBookingAccess = Boolean(isAuthenticated || token || storedToken);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      if (res.success) setBookings(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!hasBookingAccess) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) fetchBookings();
    });

    return () => {
      cancelled = true;
    };
  }, [fetchBookings, hasBookingAccess]);

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await cancelBooking(bookingId);
      if (res.success) { alert("Booking cancelled"); fetchBookings(); }
    } catch { alert("Failed to cancel"); }
  };

  const STATUS = {
    CONFIRMED: { icon: <FaCheckCircle size={10} />, cls: "s-confirmed", label: "Confirmed" },
    PENDING:   { icon: <FaHourglassHalf size={10} />, cls: "s-pending",   label: "Pending"   },
    CANCELLED: { icon: <FaBan size={10} />,           cls: "s-cancelled", label: "Cancelled" },
    EXPIRED:   { icon: <FaTimes size={10} />,         cls: "s-expired",   label: "Expired"   },
  };
  const getStatus = (s) => STATUS[s] || { icon: <FaTimes size={10} />, cls: "s-expired", label: s };

  const FILTERS = ["ALL","CONFIRMED","PENDING","CANCELLED","EXPIRED"];
  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.bookingStatus === filter);

  if (loading) return (
    <>
      <style>{PAGE_STYLES}</style>
      <div className="pg-root">
        <Header />
        <div className="pg-loading">
          <div className="pg-spinner" />
          <p className="pg-load-txt">Loading your bookings…</p>
        </div>
        <Footer />
      </div>
    </>
  );

  return (
    <>
      <style>{PAGE_STYLES}</style>
      <div className="pg-root">
        <Header />
        <div className="px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Filter Tabs */}
        <div className="pg-tabs-bar">
          <div className="pg-tabs">
            {FILTERS.map(f => {
              const count = f === "ALL" ? bookings.length : bookings.filter(b => b.bookingStatus === f).length;
              return (
                <button key={f} className={`pg-tab ${filter === f ? "pg-tab--on" : ""}`} onClick={() => setFilter(f)}>
                  {f === "ALL" ? "All" : getStatus(f).label}
                  <span className="pg-tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="pg-main">
          {!hasBookingAccess ? (
            <div className="pg-empty">
              <div className="pg-empty-icon">
                <FaTicketAlt />
              </div>
              <h3 className="pg-empty-h">Login to view your bookings</h3>
              <p className="pg-empty-p">
                Sign in to see your tickets, download passes, or manage bookings.
              </p>
              <button className="pg-btn-primary-link" onClick={() => setShowAuthModal(true)}>
                <FaTicketAlt size={13} /> Login
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <div className="pg-empty-icon">🎬</div>
              <h3 className="pg-empty-h">No bookings found</h3>
              <p className="pg-empty-p">
                {filter !== "ALL" ? `No ${filter.toLowerCase()} bookings.` : "You haven't booked any tickets yet."}
              </p>
              {filter === "ALL" && (
                <Link href="/public/shows" className="pg-btn-primary-link">
                  <FaTicketAlt size={13} /> Browse Shows
                </Link>
              )}
            </div>
          ) : (
            <div className="pg-grid">
              {filtered.map((booking, i) => {
                const st = getStatus(booking.bookingStatus);
                const seats = booking.seats || [];
                const seatCount = seats.length;
                const canCancel = booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "PENDING";

                return (
                  <div key={booking._id} className="pg-card" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className="pg-card-accent" />

                    {/* Head */}
                    <div className="pg-card-head">
                      <div className="pg-card-head-l">
                        <div className="pg-film-icon"><FaFilm size={15} /></div>
                        <div className="pg-head-text">
                          <h3 className="pg-movie">{booking.movieName}</h3>
                          <div className="pg-theater">
                            <FaMapMarkerAlt size={9} />
                            <span>{booking.theaterId?.name || "Anant Vijay Auditorium"}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`pg-badge ${st.cls}`}>{st.icon}{st.label}</span>
                    </div>

                    {/* Info */}
                    <div className="pg-info">
                      <div className="pg-info-item">
                        <div className="pg-info-icon"><FaCalendarAlt size={11} /></div>
                        <div>
                          <div className="pg-info-lbl">Date</div>
                          <div className="pg-info-val">
                            {new Date(booking.showDate).toLocaleDateString("en-IN", {
                              weekday:"short", day:"numeric", month:"short", year:"numeric"
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pg-info-item">
                        <div className="pg-info-icon"><FaClock size={11} /></div>
                        <div>
                          <div className="pg-info-lbl">Time</div>
                          <div className="pg-info-val">{booking.showTime}</div>
                        </div>
                      </div>

                      {/* Seats — full row, wraps neatly */}
                      <div className="pg-info-item pg-info-seats-row">
                        <div className="pg-info-icon"><FaChair size={11} /></div>
                        <div className="pg-seats-block">
                          <div className="pg-info-lbl">
                            Seats <span className="pg-seat-cnt">({seatCount})</span>
                          </div>
                          <div className="pg-seats">
                            {seats.slice(0, 8).map((s, idx) => (
                              <span key={idx} className="pg-chip">{s.rowName}{s.seatNumber}</span>
                            ))}
                            {seatCount > 8 && (
                              <span className="pg-chip pg-chip--more">+{seatCount - 8}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pg-info-item">
                        <div className="pg-info-icon pg-info-icon--dark"><FaTicketAlt size={11} /></div>
                        <div>
                          <div className="pg-info-lbl">Amount</div>
                          <div className="pg-info-val pg-amt">₹{booking.totalAmount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="pg-id-row">
                      <span className="pg-id-lbl">Booking ID</span>
                      <span className="pg-id-val">{booking.bookingId}</span>
                    </div>

                    {/* Actions */}
                    <div className="pg-actions">
                      <button className="pg-btn-dl" onClick={() => setSelected(booking)}>
                        <FaDownload size={11} />
                        View & Download{seatCount > 1 ? ` (${seatCount})` : ""}
                      </button>
                      {canCancel && (
                        <button className="pg-btn-cancel" onClick={() => handleCancel(booking.bookingId)}>
                          <FaTimes size={11} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      </div>
      <Foods/>
      <Footer />

      {selected && <TicketModal booking={selected} onClose={() => setSelected(null)} />}
      <AuthModal
        isOpen={showAuthModal && !hasBookingAccess}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
};

/* ────────────────────────────────────────────────────────────────
   PAGE STYLES
──────────────────────────────────────────────────────────────── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

  .pg-root { font-family:'DM Sans',sans-serif; min-height:100vh; background:var(--background,#f4f4f4); }

  /* Loading */
  .pg-loading { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:14px; }
  .pg-spinner { width:38px;height:38px;border:3px solid rgba(0,0,0,.1);border-top-color:#222;border-radius:50%;animation:spin .8s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .pg-load-txt{font-size:13px;color:#999;}

  /* Header */
  .pg-header{position:relative;background:linear-gradient(160deg,#0f0f0f 0%,#1e1e1e 100%);padding:60px 24px 44px;overflow:hidden;}
  .pg-header-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 60% at 50% -5%,rgba(160,120,20,.12) 0%,transparent 68%);}
  .pg-header-inner{max-width:1200px;margin:0 auto;position:relative;z-index:1;}
  .pg-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
  .pg-eyebrow-line{width:24px;height:2px;background:linear-gradient(90deg,#d4af37,#f4d03f);border-radius:2px;}
  .pg-eyebrow-txt{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#d4af37;}
  .pg-h1{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,44px);font-weight:900;color:#fff;margin:0;display:flex;align-items:center;gap:14px;line-height:1.1;}
  .pg-h1-icon{color:#d4af37;flex-shrink:0;}
  .pg-sub{font-size:13px;color:rgba(255,255,255,.38);margin-top:10px;max-width:400px;line-height:1.6;}

  /* Tabs bar */
  .pg-tabs-bar{background:var(--card,#fff);border-bottom:1px solid rgba(0,0,0,.07);padding:0 24px;}
  .pg-tabs{max-width:1200px;margin:0 auto;display:flex;gap:2px;overflow-x:auto;padding:10px 0;scrollbar-width:none;}
  .pg-tabs::-webkit-scrollbar{display:none;}
  .pg-tab{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;border:none;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;background:transparent;color:#777;transition:all .16s ease;}
  .pg-tab:hover{background:rgba(0,0,0,.05);color:#222;}
  .pg-tab--on{background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;}
  .pg-tab--on .pg-tab-count{background:rgba(0,0,0,.15);color:#000;}
  .pg-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:rgba(0,0,0,.07);color:#777;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;}

  /* Main */
  .pg-main{max-width:1200px;margin:0 auto;padding:28px 24px 80px;}

  /* Empty */
  .pg-empty{text-align:center;padding:72px 20px;max-width:420px;margin:0 auto;}
  .pg-empty-icon{font-size:50px;opacity:.18;margin-bottom:16px;}
  .pg-empty-h{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--foreground,#111);margin:0 0 8px;}
  .pg-empty-p{font-size:13px;color:#999;line-height:1.6;margin-bottom:22px;}
  .pg-btn-primary-link{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:700;color:#000;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;cursor:pointer;text-decoration:none;transition:all .22s;box-shadow:0 4px 16px rgba(212,175,55,.3);}
  .pg-btn-primary-link:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(212,175,55,.45);}

  /* Grid */
  .pg-grid{display:grid;grid-template-columns:1fr;gap:16px;}
  @media(min-width:700px){.pg-grid{grid-template-columns:repeat(2,1fr);}}
  @media(min-width:1060px){.pg-grid{grid-template-columns:repeat(3,1fr);}}

  /* Card */
  .pg-card{
    position:relative;border-radius:16px;
    border:1px solid rgba(0,0,0,.07);
    background:var(--card,#fff);overflow:hidden;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
    animation:card-up .44s cubic-bezier(.22,1,.36,1) forwards;
    opacity:0;transform:translateY(14px);
    transition:transform .26s ease,box-shadow .26s ease;
  }
  @keyframes card-up{to{opacity:1;transform:translateY(0)}}
  .pg-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.09);}

  /* Slim top accent — gold */
  .pg-card-accent{height:3px;background:linear-gradient(90deg,#d4af37 0%,#b8860b 100%);}

  /* Card head */
  .pg-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px 14px 11px;border-bottom:1px solid rgba(0,0,0,.05);}
  .pg-card-head-l{display:flex;align-items:center;gap:10px;min-width:0;}
  .pg-film-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;flex-shrink:0;}
  .pg-head-text{min-width:0;}
  .pg-movie{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--foreground,#111);margin:0 0 3px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px;}
  .pg-theater{display:flex;align-items:center;gap:4px;font-size:11px;color:#aaa;}

  /* Badges */
  .pg-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;}
  .s-confirmed{background:rgba(34,197,94,.1);color:#16a34a;}
  .s-pending{background:rgba(245,158,11,.1);color:#c97706;}
  .s-cancelled{background:rgba(239,68,68,.1);color:#dc2626;}
  .s-expired{background:rgba(107,114,128,.1);color:#6b7280;}

  /* Info grid */
  .pg-info{display:grid;grid-template-columns:1fr 1fr;gap:11px;padding:12px 14px;}
  .pg-info-item{display:flex;align-items:flex-start;gap:8px;}
  /* seats row spans full width */
  .pg-info-seats-row{grid-column:1/-1;}
  .pg-info-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.05);color:#666;flex-shrink:0;}
  .pg-info-icon--dark{background:linear-gradient(135deg,#d4af37,#b8860b);color:#000;}
  .pg-info-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#bbb;margin-bottom:3px;}
  .pg-info-val{font-size:12px;font-weight:600;color:var(--foreground,#111);}
  .pg-amt{font-size:14px;font-weight:700;color:#b8860b;}
  .pg-seat-cnt{color:#ccc;font-size:9px;}

  /* Seats */
  .pg-seats-block{min-width:0;}
  .pg-seats{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
  .pg-chip{
    display:inline-flex;padding:2px 7px;border-radius:5px;
    background:rgba(212,175,55,.1);color:#8a6800;
    font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;
    border:1px solid rgba(212,175,55,.22);
  }
  .pg-chip--more{background:#1a1a1a;color:#fff;border-color:#1a1a1a;}

  /* Booking ID */
  .pg-id-row{display:flex;align-items:center;justify-content:space-between;margin:0 14px 11px;padding:8px 11px;border-radius:8px;background:rgba(0,0,0,.025);border:1px solid rgba(0,0,0,.05);}
  .pg-id-lbl{font-size:9px;font-weight:500;color:#ccc;}
  .pg-id-val{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:#888;}

  /* Actions */
  .pg-actions{display:flex;gap:7px;padding:0 14px 14px;}
  .pg-btn-dl{
    flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
    padding:10px 12px;border-radius:9px;font-size:12px;font-weight:700;
    color:#000;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;cursor:pointer;
    transition:all .2s;white-space:nowrap;box-shadow:0 3px 12px rgba(212,175,55,.25);
  }
  .pg-btn-dl:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,175,55,.4);}
  .pg-btn-cancel{
    display:inline-flex;align-items:center;justify-content:center;gap:5px;
    padding:10px 12px;border-radius:9px;font-size:12px;font-weight:600;
    color:#dc2626;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.15);
    cursor:pointer;transition:all .2s;white-space:nowrap;
  }
  .pg-btn-cancel:hover{background:rgba(239,68,68,.13);transform:translateY(-1px);}
`;

/* ────────────────────────────────────────────────────────────────
   MODAL + TICKET STYLES
──────────────────────────────────────────────────────────────── */
const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  .tm-overlay{
    position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,.78);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;padding:16px;
    animation:tm-in .2s ease;
  }
  @keyframes tm-in{from{opacity:0}to{opacity:1}}
  .tm-wrap{display:flex;flex-direction:column;gap:14px;max-width:580px;width:100%;animation:tm-up .28s cubic-bezier(.22,1,.36,1);}
  @keyframes tm-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

  /* Header */
  .tm-header{display:flex;align-items:center;justify-content:space-between;}
  .tm-header-l{display:flex;align-items:center;gap:10px;}
  .tm-title{font-family:'Poppins',sans-serif;font-size:17px;font-weight:700;color:#fff;margin:0;}
  .tm-counter{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);background:rgba(255,255,255,.08);padding:3px 9px;border-radius:12px;}
  .tm-x{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.09);border:none;color:rgba(255,255,255,.6);cursor:pointer;transition:background .16s;}
  .tm-x:hover{background:rgba(255,255,255,.18);color:#fff;}

  /* Carousel */
  .tm-carousel{display:flex;align-items:center;gap:8px;}
  .tm-nav{
    flex-shrink:0;width:34px;height:34px;border-radius:50%;
    background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);
    color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .16s;
  }
  .tm-nav:hover:not(:disabled){background:rgba(255,255,255,.2);}
  .tm-nav:disabled{opacity:.25;cursor:not-allowed;}

  /* Dots */
  .tm-dots{display:flex;justify-content:center;gap:5px;}
  .tm-dot{width:7px;height:7px;border-radius:50%;border:none;background:rgba(255,255,255,.22);cursor:pointer;padding:0;transition:all .16s;}
  .tm-dot--on{background:#fff;width:18px;border-radius:4px;}

  /* Actions */
  .tm-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .tm-btn-primary{
    flex:1;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:13px;font-weight:700;
    color:#000;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;cursor:pointer;
    transition:all .2s;font-family:'Poppins',sans-serif;
    box-shadow:0 3px 14px rgba(212,175,55,.3);
  }
  .tm-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(212,175,55,.45);}
  .tm-btn-secondary{
    flex:1;min-width:130px;display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:13px;font-weight:700;
    color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
    cursor:pointer;transition:all .2s;font-family:'Poppins',sans-serif;
  }
  .tm-btn-secondary:hover{background:rgba(255,255,255,.2);transform:translateY(-1px);}
  .tm-btn-ghost{
    display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 14px;border-radius:10px;font-size:12px;font-weight:600;
    color:rgba(255,255,255,.45);background:transparent;border:1px solid rgba(255,255,255,.1);
    cursor:pointer;transition:all .2s;font-family:'Poppins',sans-serif;
  }
  .tm-btn-ghost:hover{color:rgba(255,255,255,.7);}

  /* ── Single Ticket ── */
  .st-ticket{
    display:flex;background:#fff;border-radius:16px;
    overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.55);
    width:100%;font-family:'Poppins',sans-serif;flex:1;
  }

  .st-left{flex:1.5;padding:22px 18px;display:flex;flex-direction:column;}
  .st-movie{font-size:19px;font-weight:800;color:#111;letter-spacing:-.02em;text-transform:uppercase;line-height:1.1;margin-bottom:8px;}
  .st-cat{
    display:inline-flex;align-items:center;padding:3px 11px;border-radius:20px;
    background:rgba(220,38,38,.1);color:#dc2626;
    font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    width:fit-content;margin-bottom:10px;
  }
  .st-sep{width:100%;height:1px;background:rgba(0,0,0,.07);margin:8px 0;}
  .st-row{display:flex;align-items:flex-start;gap:9px;padding:4px 0;}
  .st-ico{font-size:12px;width:16px;flex-shrink:0;margin-top:1px;}
  .st-lbl{font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#bbb;margin-bottom:2px;}
  .st-val{font-size:12px;font-weight:700;color:#111;line-height:1.3;}
  .st-sub{font-size:10px;color:#999;margin-top:1px;}
  .st-footer{display:flex;gap:10px;margin-top:4px;align-items:flex-end;}
  .st-box-wrap{display:flex;flex-direction:column;gap:4px;}
  .st-box-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#bbb;}
  .st-box{
    width:44px;height:44px;border-radius:8px;
    background:#f3f3f3;display:flex;align-items:center;justify-content:center;
    font-size:18px;font-weight:800;color:#111;
    font-family:'JetBrains Mono',monospace;
  }
  .st-price{font-size:17px;font-weight:800;color:#dc2626;padding-bottom:3px;}

  /* Perforation */
  .st-perf{display:flex;flex-direction:column;align-items:center;position:relative;width:14px;flex-shrink:0;}
  .st-perf-dot{width:17px;height:17px;border-radius:50%;background:rgba(0,0,0,.07);position:absolute;left:50%;transform:translateX(-50%);z-index:2;}
  .st-perf-dot--t{top:-8px;}
  .st-perf-dot--b{bottom:-8px;}
  .st-perf-line{
    position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);width:1px;
    background:repeating-linear-gradient(to bottom,rgba(0,0,0,.12) 0,rgba(0,0,0,.12) 5px,transparent 5px,transparent 10px);
  }

  /* Right stub */
  .st-right{
    width:136px;flex-shrink:0;
    background:#fafafa;border-left:1px dashed rgba(0,0,0,.1);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:12px;padding:18px 10px;position:relative;
  }
  .st-bkid{
    writing-mode:vertical-rl;transform:rotate(180deg);
    font-size:7px;font-weight:600;letter-spacing:.1em;
    color:#ccc;text-transform:uppercase;
    font-family:'JetBrains Mono',monospace;
    position:absolute;right:7px;top:50%;
    transform:rotate(180deg) translateY(50%);
  }
  .st-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;}
  .st-qr{width:88px;height:88px;background:#fff;border-radius:8px;border:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:center;padding:7px;}
  .st-scan{font-size:7px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#bbb;}
  .st-circle{
    width:46px;height:46px;border-radius:50%;
    background:#dc2626;color:#fff;
    font-size:13px;font-weight:800;
    display:flex;align-items:center;justify-content:center;
    font-family:'JetBrains Mono',monospace;
    box-shadow:0 4px 12px rgba(220,38,38,.3);
    letter-spacing:-.02em;
  }

  @media(max-width:500px){
    .st-ticket{flex-direction:column;}
    .st-right{width:100%;flex-direction:row;justify-content:space-around;border-left:none;border-top:1px dashed rgba(0,0,0,.1);padding:14px;}
    .st-bkid{writing-mode:horizontal-tb;transform:none;position:static;}
  }
`;

export default MyBookingsPage;
