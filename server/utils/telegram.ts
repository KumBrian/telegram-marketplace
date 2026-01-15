import { createHmac } from "node:crypto";

export const validateTelegramData = (
  initData: string,
  botToken: string
): boolean => {
  if (!botToken) {
    if (
      process.env.NODE_ENV === "development" &&
      initData.includes("hash=mock")
    ) {
      console.warn("⚠️ DEV MODE: Bypassing Telegram Validation with Mock Data");
      return true;
    }
    console.error(
      "❌ Validation Error: Bot Token is missing in server config."
    );
    return false;
  }

  // Bypass for Dev Mode Mock Data
  if (
    process.env.NODE_ENV === "development" &&
    initData.includes("hash=mock")
  ) {
    console.warn("⚠️ DEV MODE: Bypassing Telegram Validation with Mock Data");
    return true;
  }

  // 1. Parse the query string
  const urlParams = new URLSearchParams(initData);

  // 2. Extract the hash (signature)
  const hash = urlParams.get("hash");
  urlParams.delete("hash");

  if (!hash) {
    console.error("❌ Validation Error: No 'hash' found in initData.");
    return false;
  }

  // 3. Sort keys alphabetically (Telegram Requirement)
  const params: string[] = [];
  for (const [key, value] of urlParams.entries()) {
    params.push(`${key}=${value}`);
  }
  params.sort();

  // 4. Create the check string
  const dataCheckString = params.join("\n");

  // 5. Generate Secret Key & Calculate Hash
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // 6. Compare Hashes
  if (calculatedHash !== hash) {
    console.error("❌ Validation Error: Signature Mismatch.");
    console.error(`   Expected: ${calculatedHash}`);
    console.error(`   Received: ${hash}`);
    return false;
  }

  // 7. Check Expiry (Optional but recommended)
  // Telegram data is valid for a limited time (usually 24h) to prevent replay attacks.
  const authDate = parseInt(urlParams.get("auth_date") || "0");
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = now - authDate;

  // Set validity to 24 hours (86400 seconds)
  if (timeDiff > 86400) {
    console.error(`❌ Validation Error: Data Expired. (Age: ${timeDiff}s)`);
    return false;
  }

  console.log("✅ Telegram Data Validated Successfully");
  return true;
};
