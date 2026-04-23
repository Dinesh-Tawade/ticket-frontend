"use client";

import { useParams } from "next/navigation";

export default function EditUser() {
  const { id } = useParams();

  return (
    <div>
      <h1>Edit User {id}</h1>
    </div>
  );
}