"use client";

import React from "react";
import { useRouter } from "next/navigation";

type FormVals = {
  name: string;
  login_id: string;
  email: string;
  role: "admin" | "invoicing_user";
  password: string;
  confirm: string;
};

export default function AdminCreateUser() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as FormVals;

    // basic client checks from your sketch
    if (data.password !== data.confirm) {
      setErr("Passwords do not match");
      setLoading(false);
      return;
    }
    if (data.login_id.length < 6 || data.login_id.length > 12) {
      setErr("Login id must be 6–12 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8005/CreateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          login_id: data.login_id,
          email: data.email,
          role: data.role,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Request failed (${res.status})`);
      }

      // success UX
      alert("User created 🎉");
      router.push("/"); // or wherever
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card rounded-4 shadow-sm">
      <div className="card-header text-center fs-3 fw-semibold">Create User</div>
      <div className="card-body">
        {err && <div className="alert alert-danger">{err}</div>}

        <form className="row g-4" onSubmit={onSubmit}>
          {/* Name */}
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input name="name" className="form-control border-0 border-bottom rounded-0" placeholder="Full name" required />
          </div>

          {/* Role */}
          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select name="role" className="form-select border-0 border-bottom rounded-0" defaultValue="Invoicing User" required>
              <option>admin</option>
              <option>invoicing_user</option>
            </select>
          </div>

          {/* Login id */}
          <div className="col-md-6">
            <label className="form-label">Login id</label>
            <input name="login_id" className="form-control border-0 border-bottom rounded-0" placeholder="6–12 characters" minLength={6} maxLength={12} required />
          </div>

          {/* Password */}
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-control border-0 border-bottom rounded-0" placeholder="Strong password" minLength={8} required />
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">Email id</label>
            <input name="email" type="email" className="form-control border-0 border-bottom rounded-0" placeholder="user@example.com" required />
          </div>

          {/* Re-enter password */}
          <div className="col-md-6">
            <label className="form-label">Re-Enter password</label>
            <input name="confirm" type="password" className="form-control border-0 border-bottom rounded-0" placeholder="Re-enter password" minLength={8} required />
          </div>

          {/* Buttons */}
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-dark" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={() => history.back()}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
