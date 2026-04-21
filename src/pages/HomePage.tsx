import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../components/SignInForm";
import { motion } from "framer-motion";
export function HomePage() {
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  useEffect(() => {
    if (loggedInUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [loggedInUser, navigate]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-slate-900/10 dark:bg-white/5 blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              Master Your <span className="text-emerald-500">Money</span> with AI.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Experience the next generation of personal finance. Real-time tracking meets advanced Gemini intelligence for insights that actually matter.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              {[
                { icon: TrendingUp, label: "Smart Analytics" },
                { icon: ShieldCheck, label: "Secure Auth" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 shadow-soft center">
                    <feature.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{feature.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass p-8 md:p-12 rounded-[2.5rem] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/10 dark:from-slate-900/50 dark:to-slate-900/10 rounded-[2.5rem] -z-10" />
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Get Started Now</h2>
                  <p className="text-sm text-muted-foreground">Join thousands optimizing their wealth</p>
                </div>
                <Unauthenticated>
                  <SignInForm />
                </Unauthenticated>
                <Authenticated>
                  <div className="text-center py-10">
                    <Button size="lg" className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate("/dashboard")}>
                      Enter Dashboard
                    </Button>
                  </div>
                </Authenticated>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}