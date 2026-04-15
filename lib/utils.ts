export function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    // If NEXTAUTH_URL is defined and isn't localhost, use it
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    // Falls back to VERCEL_URL if running on Vercel
    return `https://${process.env.VERCEL_URL}`;
  }
  // Default to localhost for development
  return "http://localhost:3000";
}
