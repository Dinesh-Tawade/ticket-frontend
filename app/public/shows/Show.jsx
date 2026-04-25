"use client";

import React from "react";
import { getPublicShows } from "@/app/services/publicCommunication";
import { useQuery } from "@tanstack/react-query";

function Show() {
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ["publicShows"],
    queryFn: getPublicShows,
  });

  console.log("Public Shows Data:", shows);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading shows</div>;

  return (
    <div>
      <h1>Public Shows</h1>
      {shows?.data?.map((show, index) => (
        <div key={show._id || index}>
          <p>Movie: {show.movie?.name}</p>
          <p>Theater: {show.theaterId?.name}</p>
          <p>Location: {show.theaterId?.location}</p>
          <p>Date: {new Date(show.showDate).toLocaleDateString()}</p>
          <p>Time: {show.startTime} - {show.endTime}</p>
          <p>Status: {show.status}</p>
          <p>Available Seats: {show.availableSeats} / {show.totalSeats}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Show;