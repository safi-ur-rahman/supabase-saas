import { getAccountData } from "../utils/getAccountData";
import { AccountClientButton } from "./account-client-button";

export async function Account() {
  // Safe server data resolution step
  const accountData = await getAccountData();

  if (!accountData) {
    return <></>;
  }

  // Pass live, sanitized props straight down to the client layout handler
  return (
    <AccountClientButton 
      user={accountData.user} 
      subscription={accountData.subscription} 
    />
  );
}