// src/app/admin/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css"; // scoped to /admin/*
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin • Shiv Accounts Cloud",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-light">
        {/* Simple admin navbar */}
        <nav className="navbar navbar-expand navbar-light bg-white border-bottom mb-3">
          <div className="container">
            {/* <a className="navbar-brand" href="/">Admin</a> */}
          </div>
        </nav>
        <main className="container my-4">{children}</main>
      </body>
    </html>
  );
}
