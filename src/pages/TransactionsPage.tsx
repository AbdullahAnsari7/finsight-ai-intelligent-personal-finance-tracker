import { Authenticated, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import { Plus, Trash2, Search, Download, Ghost } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
export function TransactionsPage() {
  const transactions = useQuery(api.transactions.list);
  const removeTransaction = useMutation(api.transactions.remove);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const filtered = transactions?.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const txMonth = new Date(t.date).toISOString().slice(0, 7);
    return matchesSearch && txMonth === filterMonth;
  });
  const handleDelete = async (id: any) => {
    try {
      await removeTransaction({ id });
      toast.success("Transaction deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };
  const exportCSV = () => {
    if (!filtered || filtered.length === 0) return;
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = filtered.map(t => [
      format(t.date, 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.amount,
      t.description || ""
    ]);
    const content = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions_${filterMonth}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Export started");
  };
  return (
    <Authenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">Manage your history and log new activity.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="rounded-xl bg-secondary/50 border-none w-40"
                />
                <Button variant="outline" size="icon" onClick={exportCSV} className="rounded-xl hover:bg-slate-100 transition-colors">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-9 rounded-xl bg-secondary/50 border-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-soft h-11 px-6">
                    <Plus className="w-4 h-4" /> Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add Transaction</DialogTitle>
                  </DialogHeader>
                  <TransactionForm onSuccess={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-border/50 shadow-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filtered && filtered.length > 0 ? (
                    filtered.map((tx, idx) => (
                      <motion.tr 
                        key={tx._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group border-b border-border/30 last:border-0"
                      >
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {format(tx.date, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {tx.category}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-slate-600 dark:text-slate-400">
                          {tx.description || "-"}
                        </TableCell>
                        <TableCell className={`text-right font-display font-bold ${tx.type === 'income' ? 'text-finance-success' : 'text-finance-expense'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleDelete(tx._id)}
                            className="p-2 text-muted-foreground hover:text-finance-expense transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Ghost className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">No transactions found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters or adding a new record.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}