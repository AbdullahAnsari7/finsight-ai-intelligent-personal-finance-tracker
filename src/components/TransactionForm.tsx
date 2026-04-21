import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
const CATEGORIES = ["Salary", "Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Others"];
export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const addTransaction = useMutation(api.transactions.add);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Invalid amount");
      return;
    }
    setSubmitting(true);
    try {
      await addTransaction({
        amount: val,
        type,
        category,
        date: new Date(date).getTime(),
        description: description.trim() || undefined,
      });
      toast.success("Transaction recorded");
      onSuccess();
    } catch (err) {
      toast.error("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger className="rounded-xl border-none bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      </div>
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          className="rounded-xl border-none bg-secondary/50 text-lg font-bold"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input 
          type="date" 
          className="rounded-xl border-none bg-secondary/50"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Input 
          placeholder="What was this for?" 
          className="rounded-xl border-none bg-secondary/50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={submitting}>
        {submitting ? "Processing..." : "Confirm Transaction"}
      </Button>
    </form>
  );
}