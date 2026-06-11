"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard } from "lucide-react";
import { Subscription, UserProfile } from "../types/account.types";
import { SubscriptionDetails } from "./subscription-details";
import { PersonalDetails } from "./personal-details";
import { Button } from "@/components/ui/button";
import { supabase } from "../../auth/utils/supabase";

interface AccountDialogProps {
  open: boolean;
  isOpen: (open: boolean) => void;
  user: UserProfile;
  subscription: Subscription;
}

export const AccountDialog = ({
  open,
  isOpen,
  user,
  subscription,
}: AccountDialogProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("success");

  useEffect(() => {
    if (paymentSuccess === "true" && open) {
      console.log("Payment success detected! Evicting layout cache layers...");
      router.refresh();
    }
  }, [paymentSuccess, open, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    isOpen(false); 
    router.push("/"); 
    router.refresh(); 
  };

  return (
    <Dialog open={open} onOpenChange={isOpen}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your personal profile settings and subscription parameters.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          {/* 1. Personal Information Content Panel */}
          <TabsContent value="personal" className="space-y-4 pt-4">
            <PersonalDetails user={user} />
          </TabsContent>

          {/* 2. Subscription Details Content Panel */}
          <TabsContent value="subscription" className="space-y-4 pt-4">
            <SubscriptionDetails subscription={subscription} />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button className="w-full" variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};