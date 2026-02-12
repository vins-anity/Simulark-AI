/**
 * Get the base URL for the application
 * Always returns a URL without a trailing slash
 */
export function getBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Handle server-side environment variables
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return url.replace(/\/$/, "");
}
