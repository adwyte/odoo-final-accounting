"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";


const loginSchema = z.object({
  email: z.string().email("Use a valid email, please."),
  password: z.string().min(6, "At least 6 characters."),
  remember: z.boolean().default(false),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    name: z.string().min(2, "Name looks too short."),
    login_id: z.string().min(3, "Login ID must be at least 3 characters."),
    email: z.string().email("Use a valid email, please."),
    password: z.string().min(8, "Minimum 8 characters."),
    confirm: z.string().min(8, "Minimum 8 characters."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  });
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-start justify-center px-4 pt-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-slate-200 rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Shiv Accounts Cloud</CardTitle>
            <CardDescription>Orders, Invoices &amp; Real-Time Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="login" asChild>
                  <Link href="/login">Log in</Link>
                </TabsTrigger>
                <TabsTrigger value="signup" asChild>
                  <Link href="/signup">Sign up</Link>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const [show, setShow] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_or_email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      alert(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Remember */}
      <div className="flex items-center space-x-2">
        <Checkbox id="remember" {...register("remember")} />
        <Label htmlFor="remember" className="text-sm text-muted-foreground">
          Remember me
        </Label>
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

function SignupForm() {
  const [show, setShow] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      login_id: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    try {
      const payload = {
        name: values.name,
        login_id: values.login_id,
        email: values.email,
        password: values.password,
        role: "invoicing_user",
      };

      const res = await fetch("/CreateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Sign up failed");
      }

      await res.json();
      alert("Account created! Please log in.");
      router.push("/login"); // ✅ go back to login
    } catch (err: unknown) {
      console.error("SIGNUP ERROR:", err);
      alert(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="name" placeholder="e.g., Nimesh Pathak" className="pl-9" {...register("name")} />
        </div>
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Login ID */}
      <div className="space-y-2">
        <Label htmlFor="login_id">Login ID</Label>
        <Input id="login_id" placeholder="unique login id" {...register("login_id")} />
        {errors.login_id && <p className="text-xs text-red-500">{errors.login_id.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={show ? "text" : "password"}
            placeholder="At least 8 characters"
            className="pl-9 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input id="confirm" type="password" placeholder="Re-enter password" {...register("confirm")} />
        {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message}</p>}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Sign up"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
