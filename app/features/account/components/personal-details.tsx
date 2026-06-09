import { UserProfile } from "../types/account.types";

export const PersonalDetails = ({ user }: { user: UserProfile }) => {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="grid gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Full Name
        </span>
        <p className="text-sm font-semibold text-foreground">{user.name}</p>
      </div>
      <div className="grid gap-1 border-t pt-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Email Address
        </span>
        <p className="text-sm font-semibold text-foreground break-all">
          {user.email}
        </p>
      </div>
    </div>
  );
};
