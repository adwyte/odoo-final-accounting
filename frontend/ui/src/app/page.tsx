"use client";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to Shiv Accounts Cloud</h1>
      <p className="text-gray-600 mb-8">Manage your accounts with ease.</p>

      <div className="flex space-x-4">
        <Link
          href="/login"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
