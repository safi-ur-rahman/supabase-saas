import { getAccountData } from "../utils/getAccountData";
import { AccountClientButton } from "./account-client-button";

export async function Account() {
  // Safe server data resolution step
  const accountData = await getAccountData();

  if (!accountData) {
    return <p className="text-xs text-muted-foreground">Session expired</p>;
  }

  // Pass live, sanitized props straight down to the client layout handler
  return (
    <AccountClientButton 
      user={accountData.user} 
      subscription={accountData.subscription} 
    />
  );
}