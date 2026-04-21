import { Authenticated, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import { Plus, Trash2, Search, Filter } from "lucide-react";
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
export function TransactionsPage() {
  const transactions = useQuery(api.transactions.list);
  const removeTransaction = useMutation(api.transactions.remove);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = transactions?.filter(t => 
    t.category.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );
  const handleDelete = async (id: any) => {
    try {
      await removeTransaction({ id });
      toast.success("Transaction deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
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
            <div className="flex items-center gap-3">
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
                  <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white center gap-2 shadow-soft">
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
                {filtered && filtered.length > 0 ? (
                  filtered.map((tx) => (
                    <TableRow key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {format(tx.date, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-2xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                          className="p-2 text-muted-foreground hover:text-finance-expense transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}