"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { Subscription } from "../types/account.types";
import { supabase } from "../../auth/utils/supabase"; // Ensure this matches your browser client import path

export const SubscriptionDetails = ({
  subscription,
}: {
  subscription: Subscription;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isPremium = subscription.plan === "Premium";

  const usagePercentage =
    (subscription.tasksCreated / subscription.tasksLimit) * 100;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // 1. Capture the client's transient JWT session signature from local memory
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "Unable to read active user session profile verification.",
        );
      }

      // 2. Query your backend Supabase Edge Function endpoint array configuration
      // Replace with your local hosting URL or production project address layout
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-stripe-session`;

      console.log(
        "🚀 Invoking Stripe gateway setup via secure Edge Function context...",
      );
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass authorization credentials directly into the token reader
          Authorization: `Bearer ${session.access_token}`,
          ApiKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error ?? "Failed to compile background Stripe pipeline session.",
        );
      }

      // 3. Hand over complete control to Stripe's secure window layers
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe routing destination payload returned empty.");
      }
    } catch (error: any) {
      console.error(
        "Stripe direction vector runtime exception:",
        error.message,
      );
      alert(`Billing Portal error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Active Plan Metadata */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current Plan
          </span>
          <h4 className="text-lg font-bold text-foreground flex items-center gap-1.5 mt-0.5">
            {subscription.plan}
            <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
          </h4>
        </div>

        {isPremium && subscription.renewalDate && (
          <div className="text-right">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Renews On
            </span>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {subscription.renewalDate}
            </p>
          </div>
        )}
      </div>

      {/* Task Limit Metrics utilizing Shadcn UI Progress Component */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-muted-foreground">Task Usage Meter</span>
          <span className="text-foreground">
            {subscription.tasksCreated} / {subscription.tasksLimit} tasks
          </span>
        </div>

        <Progress value={usagePercentage} className="h-2" />
      </div>

      {/* Dynamic Action Button Wrapper */}
      <div className="pt-2 border-t flex flex-col">
        <Button
          onClick={handleManageSubscription}
          disabled={isLoading}
          variant={isPremium ? "destructive" : "default"}
          className="w-full gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Request...
            </>
          ) : isPremium ? (
            <>
              <XCircle className="h-4 w-4" />
              Manage or Cancel Subscription
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 fill-current" />
              Upgrade to Premium
            </>
          )}
        </Button>

        {!isPremium && (
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Unlock increased task limits and 24/7 support.
          </p>
        )}
      </div>
    </div>
  );
};
