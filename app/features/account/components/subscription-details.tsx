import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { Subscription } from "../types/account.types";

export const SubscriptionDetails = ({
  subscription,
}: {
  subscription: Subscription;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isPremium = subscription.plan === "Premium";

  const usagePercentage =
    (subscription.tasksCreated / subscription.tasksLimit) * 100;

  // This handler is perfectly primed for your future Stripe API implementation
  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      if (isPremium) {
        // TODO: Integrate Stripe Customer Portal redirect link
        console.log(
          "Redirecting to Stripe Customer Portal to cancel/manage...",
        );
        // const response = await fetch('/api/stripe/portal', { method: 'POST' });
        // const { url } = await response.json();
        // window.location.href = url;
      } else {
        // TODO: Integrate Stripe Checkout link for upgrades
        console.log(
          "Redirecting to Stripe Checkout session for Premium upgrade...",
        );
        // const response = await fetch('/api/stripe/checkout', { method: 'POST' });
        // const { url } = await response.json();
        // window.location.href = url;
      }

      // Simulating network delay for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Stripe redirection error:", error);
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
              Cancel Subscription
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
