import { Authenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
export function DashboardPage() {
  const stats = useQuery(api.transactions.getStats);
  if (stats === undefined) return <div className="p-12 text-center text-muted-foreground">Loading financial data...</div>;
  const cards = [
    { label: "Total Balance", value: stats?.totalBalance ?? 0, icon: Wallet, color: "text-slate-900 dark:text-white" },
    { label: "Income", value: stats?.totalIncome ?? 0, icon: TrendingUp, color: "text-finance-success" },
    { label: "Expenses", value: stats?.totalExpenses ?? 0, icon: TrendingDown, color: "text-finance-expense" },
  ];
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
              <p className="text-muted-foreground">Welcome back to your financial control center.</p>
            </div>
            <Link to="/transactions">
              <button className="btn-gradient rounded-xl px-6">Add Transaction</button>
            </Link>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-soft overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                        <h3 className={`text-3xl font-display font-bold ${card.color}`}>
                          ${card.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900 center shadow-sm group-hover:scale-110 transition-transform">
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-none shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Category Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square">
                  {stats?.categoryData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full center text-muted-foreground text-sm flex-col gap-2">
                      <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 center mb-2">📊</div>
                      No spending data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 border-none shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Link to="/transactions" className="text-xs font-bold text-emerald-500 hover:underline center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentTransactions.length ? (
                    stats.recentTransactions.map((tx, i) => (
                      <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{tx.category}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {format(tx.date, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <p className={`font-display font-bold ${tx.type === 'income' ? 'text-finance-success' : 'text-finance-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-muted-foreground text-sm">No transactions yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}