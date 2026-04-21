import React from "react";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronRight, Target } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
export function DashboardPage() {
  const stats = useQuery(api.transactions.getStats);
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const budgetStatus = useQuery(api.budgets.getBudgetStatus, { period: currentPeriod });
  if (stats === undefined) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/20" />
        <p className="text-muted-foreground font-medium">Syncing with ledger...</p>
      </div>
    );
  }
  const trendData = stats?.recentTransactions ? [...stats.recentTransactions].reverse().reduce((acc: any[], curr) => {
    const lastVal = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const newVal = curr.type === 'income' ? lastVal + curr.amount : lastVal - curr.amount;
    acc.push({
      date: format(curr.date, 'MM/dd'),
      balance: newVal,
    });
    return acc;
  }, []) : [];
  // Calculate overall budget health
  const totalBudgeted = budgetStatus?.reduce((acc, b) => acc + b.amount, 0) || 0;
  const totalSpent = budgetStatus?.reduce((acc, b) => acc + b.spent, 0) || 0;
  const overallBudgetPercent = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const cards = [
    { label: "Total Balance", value: stats?.totalBalance ?? 0, icon: Wallet, color: "text-slate-900 dark:text-white", bg: "bg-slate-900/5 dark:bg-white/5" },
    { label: "Income", value: stats?.totalIncome ?? 0, icon: TrendingUp, color: "text-finance-success", bg: "bg-emerald-500/5" },
    { label: "Expenses", value: stats?.totalExpenses ?? 0, icon: TrendingDown, color: "text-finance-expense", bg: "bg-rose-500/5" },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="py-8 md:py-10 lg:py-12 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
              <p className="text-muted-foreground">Welcome back to your financial control center.</p>
            </div>
            <Link to="/transactions">
              <button className="btn-gradient rounded-xl px-6 py-2 h-11">Add Transaction</button>
            </Link>
          </motion.header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className={`border-none shadow-soft overflow-hidden group ${card.bg}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                        <h3 className={`text-3xl font-display font-bold ${card.color}`}>
                          ${card.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="border-none shadow-soft bg-white dark:bg-slate-900 overflow-hidden h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Balance Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] w-full pr-4 pb-4">
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <YAxis hide />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-4">
                        <div className="h-24 w-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-end justify-around p-4 opacity-50">
                          <div className="w-4 h-8 bg-slate-200 dark:bg-slate-700 rounded-t" />
                          <div className="w-4 h-12 bg-slate-200 dark:bg-slate-700 rounded-t" />
                          <div className="w-4 h-6 bg-slate-200 dark:bg-slate-700 rounded-t" />
                        </div>
                        <p>Insufficient transaction history for trends</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="border-none shadow-soft bg-white dark:bg-slate-900 h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Budget Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4">
                    <h4 className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                      {Math.round(overallBudgetPercent)}%
                    </h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Total Spent</p>
                  </div>
                  <Progress value={overallBudgetPercent} className="h-3" />
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budgeted</span>
                      <span className="font-semibold">${totalBudgeted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-semibold">${totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                  <Link to="/budgets">
                    <button className="w-full mt-4 py-2 text-xs font-bold text-emerald-500 bg-emerald-500/5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                      Manage Budgets
                    </button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="border-none shadow-soft h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Category Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square">
                    {stats?.categoryData?.length ? (
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
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-2">📊</div>
                        No spending data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-none shadow-soft h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <Link to="/transactions" className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentTransactions?.length ? (
                      stats.recentTransactions.map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Authenticated>
  );
}