import React from "react";
import { Authenticated, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Shield, Palette, Database, Trash2, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { SignOutButton } from "@/components/SignOutButton";
export function SettingsPage() {
  const user = useQuery(api.auth.loggedInUser);
  const handleDeleteData = async () => {
    if (!confirm("Are you sure? This will delete all your recorded transactions and cannot be undone.")) return;
    toast.error("Data deletion is not enabled in this preview version.");
  };
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and app preferences.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar-like Navigation for settings could go here, but using simple cards for now */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Section */}
              <Card className="border-none shadow-soft rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Information</CardTitle>
                    <CardDescription>Your personal account details.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">{user?.email || "No email linked"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Status</Label>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">Active & Secured</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Preferences Section */}
              <Card className="border-none shadow-soft rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Appearance</CardTitle>
                    <CardDescription>Customize how FinSight looks.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">Display Theme</p>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark mode preferences.</p>
                    </div>
                    <ThemeToggle className="relative top-0 right-0" />
                  </div>
                </CardContent>
              </Card>
              {/* Data Management Section */}
              <Card className="border-none shadow-soft rounded-[2rem] border-rose-500/20 overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Data Management</CardTitle>
                    <CardDescription>Export or remove your financial data.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-600 dark:text-rose-400">Clear All Transactions</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your entire transaction history.</p>
                    </div>
                    <Button variant="destructive" className="rounded-xl gap-2" onClick={handleDeleteData}>
                      <Trash2 className="w-4 h-4" />
                      Wipe Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-soft rounded-[2rem] bg-slate-900 text-white p-8 space-y-4">
                <h3 className="text-xl font-bold">Premium Support</h3>
                <p className="text-slate-400 text-sm">Need help with your account? Our advisors are always ready to assist.</p>
                <Link to="/ai-chat">
                  <Button variant="outline" className="w-full rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Open Chat Support
                  </Button>
                </Link>
              </Card>
              <Card className="border-none shadow-soft rounded-[2rem] p-8 flex flex-col items-center text-center gap-4">
                <p className="text-sm text-muted-foreground">Signed in as <br /><span className="font-bold text-slate-900 dark:text-white">{user?.email}</span></p>
                <SignOutButton />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
import { Link } from "react-router-dom";