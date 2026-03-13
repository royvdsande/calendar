"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your productivity workspace.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
        <Button className="w-full" variant="outline" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Continue with Google
        </Button>
        <p className="text-sm">No account? <Link className="underline" href="/signup">Create one</Link></p>
      </Card>
    </main>
  );
}
