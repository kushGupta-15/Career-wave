"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { createJobCheckoutSession } from "@/app/action";
import { toast } from "sonner";

interface PayJobButtonProps {
  jobId: string;
  price?: number;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PayJobButton({
  jobId,
  price,
  variant = "default",
  size = "sm",
  className,
}: PayJobButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await createJobCheckoutSession(jobId);
      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initiate payment session";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading}
      onClick={handlePay}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <CreditCard className="w-3.5 h-3.5 mr-1.5" />
      )}
      {loading ? "Redirecting..." : price ? `Pay & Publish ($${price})` : "Pay & Publish"}
    </Button>
  );
}
