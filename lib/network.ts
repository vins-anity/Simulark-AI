const UNKNOWN_IP = "unknown";

function normalizeIpCandidate(raw: string): string | null {
  let candidate = raw.trim();

  if (!candidate) {
    return null;
  }

  if (candidate.includes(",")) {
    candidate = candidate.split(",")[0]?.trim() ?? "";
  }

  if (candidate.toLowerCase().startsWith("for=")) {
    candidate = candidate.slice(4).trim();
    if (candidate.includes(";")) {
      candidate = candidate.split(";")[0]?.trim() ?? "";
    }
  }

  if (!candidate) {
    return null;
  }

  // Strip optional surrounding quotes.
  if (
    candidate.length >= 2 &&
    candidate.startsWith('"') &&
    candidate.endsWith('"')
  ) {
    candidate = candidate.slice(1, -1).trim();
  }

  if (!candidate || candidate.toLowerCase() === UNKNOWN_IP) {
    return null;
  }

  // Bracketed IPv6 may include a port: [2001:db8::1]:443
  if (candidate.startsWith("[") && candidate.includes("]")) {
    const closingBracketIndex = candidate.indexOf("]");
    const ipv6 = candidate.slice(1, closingBracketIndex).trim();
    return ipv6 || null;
  }

  // IPv4 with port: 203.0.113.5:12345
  if (candidate.includes(".") && candidate.includes(":")) {
    const maybeIpv4 = candidate.split(":")[0]?.trim() ?? "";
    return maybeIpv4 || null;
  }

  return candidate;
}

export function getClientIp(headers: Headers): string {
  const prioritizedHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-vercel-forwarded-for",
    "forwarded",
  ];

  for (const headerName of prioritizedHeaders) {
    const value = headers.get(headerName);
    if (!value) {
      continue;
    }
    const parsedIp = normalizeIpCandidate(value);
    if (parsedIp) {
      return parsedIp;
    }
  }

  return UNKNOWN_IP;
}
