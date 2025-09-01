
"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function AdminPage() {
  const { user } = useAuth();
  type StaffUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only MASTER users can access
  if (!user || user.role !== "MASTER") {
    return <div className="p-6">Access denied. Only MASTER users can manage staff.</div>;
  }

  // Fetch staff list
  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setStaff(data);
      } catch (e) {
        setError("Failed to load staff list.");
      }
      setLoading(false);
    }
    fetchStaff();
  }, []);

  // Handle form input
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Add new staff
  async function handleAddUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user) {
      setError("User not authenticated.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId: user.organizationId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to add user.");
        return;
      }
      setSuccess("User added!");
      setForm({ name: "", email: "", password: "", role: "USER" });
      // Refresh staff list
      const updated = await fetch("/api/admin/users").then(r => r.json());
      setStaff(updated);
    } catch (e) {
      setError("Failed to add user.");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Staff Management</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Add New Staff</h2>
        <form onSubmit={handleAddUser} className="space-y-2">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded w-full" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded w-full" type="email" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded w-full" type="password" required />
          <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded w-full">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="MASTER">Master</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Staff</button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Current Staff</h2>
        {loading ? (
          <div>Loading staff...</div>
        ) : staff.length === 0 ? (
          <div>No staff found.</div>
        ) : (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Active</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u: StaffUser) => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border">{u.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
