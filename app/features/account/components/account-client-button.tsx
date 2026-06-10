"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { AccountDialog } from "./account-dialog";
import { Subscription, UserProfile } from "../types/account.types";

interface AccountClientButtonProps {
  user: UserProfile;
  subscription: Subscription;
}

export function AccountClientButton({ user, subscription }: AccountClientButtonProps) {
  const [open, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <UserRound className="h-5 w-5" />
        </Button>
      </div>

      <AccountDialog
        open={open}
        isOpen={setIsOpen}
        user={user}
        subscription={subscription}
      />
    </>
  );
}