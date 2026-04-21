import { Authenticated, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Sparkles, BrainCircuit, RefreshCw, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
export function InsightsPage() {
  const generateInsight = useAction(api.insights.generateInsight);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const handleGenerate = async () => {
    setLoading(true);
    setInsight(null);
    try {
      const result = await generateInsight();
      setInsight(result);
      toast.success("Insight generated successfully");
    } catch (e) {
      toast.error("Failed to generate report. Check your AI configuration.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-12">
          <header className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 center shadow-lg">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your AI Financial <span className="text-emerald-500">Advisor</span></h1>
            <p className="text-muted-foreground text-lg">
              Analyze your patterns, detect leaks, and get personalized wealth-building strategies powered by Gemini.
            </p>
            <Button 
              size="lg" 
              onClick={handleGenerate} 
              disabled={loading}
              className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg hover:-translate-y-1 transition-all"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {insight ? "Regenerate Analysis" : "Generate Financial Report"}
            </Button>
          </header>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-3xl bg-slate-50 dark:bg-slate-900/50 animate-pulse border border-border/50" />
                ))}
              </motion.div>
            ) : insight ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border-none shadow-glow-lg rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
                  <CardContent className="p-10 md:p-14 space-y-8">
                    <div className="flex items-center gap-4 text-emerald-500">
                      <BarChart4 className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Executive Insight Report</span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {insight}
                      </p>
                    </div>
                    <div className="pt-8 border-t border-border/50">
                      <p className="text-xs text-muted-foreground italic">
                        * Analysis based on your latest 50 transactions. FinSight AI recommendations are informational.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="center py-20 opacity-50"
              >
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-900 center mx-auto">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">Click generate to start the analysis.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Authenticated>
  );
}