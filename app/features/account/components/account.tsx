"use client";

import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { AccountDialog } from "./account-dialog";
import { DummySubscription, DummyUser } from "@/app/dummy-data/account";

export const Account = () => {
  const [open, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <UserRound className="h-6 w-6" />
        </Button>
      </div>

      <AccountDialog
        open={open}
        isOpen={setIsOpen}
        user={DummyUser}
        subscription={DummySubscription}
      />
    </>
  );
};
