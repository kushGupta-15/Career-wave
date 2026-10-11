"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { withdrawApplication } from "@/app/action";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface WithdrawApplicationButtonProps {
  applicationId: string;
  jobTitle: string;
}

export function WithdrawApplicationButton({
  applicationId,
  jobTitle,
}: WithdrawApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleWithdraw = async () => {
    try {
      setIsPending(true);
      await withdrawApplication(applicationId);
      toast.success("Application successfully withdrawn");
      setOpen(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to withdraw application");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your application for{" "}
            <strong>{jobTitle}</strong>? This action cannot be undone and your
            submitted resume and cover letter will be removed from the company&apos;s
            view.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleWithdraw}
            disabled={isPending}
          >
            {isPending ? "Withdrawing..." : "Confirm Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
