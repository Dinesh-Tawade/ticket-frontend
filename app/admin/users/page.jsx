"use client";

import useAuth from "@/app/hooks/useAuth";
import Link from "next/link";

export default function Users() {
  useAuth();

  return (
    <div>
      <h1 className="text-xl mb-3">Users</h1>

      <Link
        href="/admin/users/add"
        className="bg-green-500 text-white px-3 py-1"
      >
        Add User
      </Link>

      <table className="mt-4 w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-2">John</td>
            <td className="border p-2">
              <Link href="/admin/users/edit/1">Edit</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}