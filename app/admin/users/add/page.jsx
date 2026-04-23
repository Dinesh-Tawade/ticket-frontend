"use client";

export default function AddUser() {
  return (
    <div>
      <h1>Add User</h1>

      <input placeholder="Name" className="border p-2" />
      <button className="bg-blue-500 text-white p-2 ml-2">
        Save
      </button>
    </div>
  );
}