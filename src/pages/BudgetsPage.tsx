import { Authenticated, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PiggyBank, Plus, Target } from "lucide-react";
const CATEGORIES = ["Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Others"];
export function BudgetsPage() {
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const budgetStatus = useQuery(api.budgets.getBudgetStatus, { period: currentPeriod });
  const upsertBudget = useMutation(api.budgets.upsert);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid limit");
      return;
    }
    setIsSubmitting(true);
    try {
      await upsertBudget({
        category,
        amount: val,
        period: currentPeriod,
      });
      toast.success("Budget set successfully");
      setAmount("");
    } catch (err) {
      toast.error("Failed to update budget");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Monthly Budgets</h1>
              <p className="text-muted-foreground">Control your spending for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Goal Mode Active</span>
            </div>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="border-none shadow-soft rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    Set Category Limit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpsert} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-xl border-none bg-secondary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Limit ($)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-xl border-none bg-secondary/50 font-bold"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Set Budget"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {budgetStatus && budgetStatus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetStatus.map((b, i) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-none shadow-soft rounded-2xl overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{b.category}</p>
                              <h4 className="text-xl font-bold">${b.spent.toLocaleString()} / ${b.amount.toLocaleString()}</h4>
                            </div>
                            <div className={`h-8 w-8 rounded-lg center ${b.percent > 90 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <PiggyBank className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress value={b.percent} className={`h-2 ${b.percent > 90 ? 'bg-rose-100' : 'bg-emerald-100'}`} />
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                              <span>{Math.round(b.percent)}% used</span>
                              <span className={b.remaining < 0 ? "text-rose-500 font-bold" : ""}>
                                {b.remaining < 0 ? `Over by $${Math.abs(b.remaining)}` : `$${b.remaining} left`}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full center flex-col gap-4 text-muted-foreground py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-border">
                  <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 center shadow-sm">
                    <PiggyBank className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-600 dark:text-slate-400">No budgets defined for this month</p>
                    <p className="text-sm">Start by setting a category limit on the left.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}