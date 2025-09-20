"use client";
import React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, GithubIcon, ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "next-auth/react";

// Schemas
const loginSchema = z.object({
  email: z.string().email("Use a valid email, please."),
  password: z.string().min(6, "At least 6 characters."),
  remember: z.boolean().default(false), // ← NOT optional
});
type LoginValues = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  fullName: z.string().min(2, "Name looks too short."),
  email: z.string().email("Use a valid email, please."),
  password: z.string().min(8, "Minimum 8 characters."),
  confirm: z.string().min(8, "Minimum 8 characters."),
  orgName: z.string().optional(),
  accept: z.boolean().refine((v) => v === true, { message: "You need to accept the Terms." }),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match." });
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="shadow-xl border-slate-200 rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Shiv Accounts Cloud</CardTitle>
            <CardDescription>Orders, Invoices &amp; Real-Time Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="login" asChild><Link href="/login">Log in</Link></TabsTrigger>
                <TabsTrigger value="signup" asChild><Link href="/signup">Sign up</Link></TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6"><LoginForm /></TabsContent>
              <TabsContent value="signup" className="mt-6"><SignupForm /></TabsContent>
            </Tabs>

            <Separator className="my-6" />
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => signIn("google")}
              >
                {/* Google SVG icon */}
                <svg viewBox="0 0 533.5 544.3" className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg"><path d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h147.3c-6.4 34.7-25.7 64-54.7 83.7v69.3h88.4c51.7-47.6 80.5-117.8 80.5-197.9z"/><path d="M272 544.3c73.5 0 135.2-24.3 180.3-66.1l-88.4-69.3c-24.5 16.4-55.9 26-91.9 26-70.7 0-130.6-47.7-152-111.8H29.7v70.2C74.4 486.3 166.5 544.3 272 544.3z"/><path d="M120 322.9c-10.3-30.7-10.3-64 0-94.7V158H29.7C-9.8 235.4-9.8 335.3 29.7 412.8l90.3-69.9z"/><path d="M272 107.7c39.9-.6 78.2 14 107.5 41.1l80.5-80.5C407 24.2 345.3 0 272 0 166.5 0 74.4 57.9 29.7 131.5l90.3 70.2C141.4 155.4 201.3 107.7 272 107.7z"/></svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => signIn("github")}
              >
                <GithubIcon className="h-4 w-4 mr-2" /> Continue with GitHub
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6 text-center">
              Admin · Invoicing User · Contact — roles are applied after login.
            </p>
          </CardContent>
        </Card>

        <footer className="text-center mt-6 text-xs text-slate-500">
          By continuing, you agree to our <Link href="/legal/terms" className="underline underline-offset-4">Terms</Link> and <Link href="/legal/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
        </footer>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const [show, setShow] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: false } });

  const onSubmit: import("react-hook-form").SubmitHandler<LoginValues> = async (values) => { console.log("LOGIN", values); await new Promise(r => setTimeout(r, 600)); };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="email" type="email" placeholder="you@company.com" className="pl-9" {...register("email")} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10" {...register("password")} />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" {...register("remember")} />
          <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
        </div>
        <Link href="/forgot" className="text-sm underline underline-offset-4">Forgot password?</Link>
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

function SignupForm() {
  const [show, setShow] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { fullName: "", email: "", password: "", confirm: "", orgName: "", accept: false } });

  const onSubmit = async (values: SignupValues) => { console.log("SIGNUP", values); await new Promise(r => setTimeout(r, 700)); };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" placeholder="e.g., Nimesh Pathak" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email2">Work email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="email2" type="email" placeholder="you@shivfurniture.com" className="pl-9" {...register("email")} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="orgName">Organization (optional)</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="orgName" placeholder="Shiv Furniture - Main Branch" className="pl-9" {...register("orgName")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password2">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input id="password2" type={show ? "text" : "password"} placeholder="At least 8 characters" className="pl-9 pr-10" {...register("password")} />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" type="password" placeholder="Re-enter password" {...register("confirm")} />
        {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message}</p>}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox id="accept" {...register("accept")} />
        <Label htmlFor="accept" className="text-sm text-muted-foreground">
          I agree to the <Link href="/legal/terms" className="underline">Terms</Link> and <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </Label>
      </div>
      {errors.accept && <p className="text-xs text-red-500">{errors.accept.message}</p>}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}