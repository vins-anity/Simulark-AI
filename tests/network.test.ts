import { describe, expect, it } from "vitest";
import { getClientIp } from "../lib/network";

function createHeaders(entries: Record<string, string>): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(entries)) {
    headers.set(key, value);
  }
  return headers;
}

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = createHeaders({
      "x-forwarded-for": "203.0.113.10, 10.0.0.5, 10.0.0.6",
    });

    expect(getClientIp(headers)).toBe("203.0.113.10");
  });

  it("strips port from IPv4 address", () => {
    const headers = createHeaders({
      "x-forwarded-for": "198.51.100.9:5150",
    });

    expect(getClientIp(headers)).toBe("198.51.100.9");
  });

  it("extracts bracketed IPv6 address", () => {
    const headers = createHeaders({
      "x-forwarded-for": "[2001:db8::5]:443",
    });

    expect(getClientIp(headers)).toBe("2001:db8::5");
  });

  it("falls back to cf-connecting-ip", () => {
    const headers = createHeaders({
      "cf-connecting-ip": "192.0.2.77",
    });

    expect(getClientIp(headers)).toBe("192.0.2.77");
  });

  it("parses forwarded header fallback", () => {
    const headers = createHeaders({
      forwarded: "for=198.51.100.25;proto=https;by=203.0.113.43",
    });

    expect(getClientIp(headers)).toBe("198.51.100.25");
  });

  it("returns unknown when no usable client ip headers exist", () => {
    const headers = createHeaders({
      "x-forwarded-for": "unknown",
    });

    expect(getClientIp(headers)).toBe("unknown");
  });
});
