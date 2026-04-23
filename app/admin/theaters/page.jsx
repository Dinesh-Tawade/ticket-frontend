"use client";

import { useEffect, useState } from "react";
import { Theaters } from "@/app/services/adminCommunication";

export default function TheaterPage() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const ownerId = "YOUR_OWNER_ID"; // 🔥 dynamic later
        const res = await Theaters(ownerId);

        console.log("THEATER DATA:", res);

        if (res?.data) {
          setTheaters(res.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  if (loading) {
    return <p className="p-6">Loading theaters...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Theaters</h1>

      <div className="grid grid-cols-3 gap-6">
        {theaters.map((t, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              {t.theaterName}
            </h2>

            <p className="text-gray-600">{t.theaterLocation}</p>
            <p className="text-gray-500 text-sm">
              {t.city}, {t.state} - {t.pincode}
            </p>

            <div className="mt-3 text-sm space-y-1">
              <p>🎬 Screens: {t.totalScreens}</p>
              <p>📞 {t.contactNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}