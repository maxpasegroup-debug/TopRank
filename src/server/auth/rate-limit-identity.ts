import { isIP } from "node:net";

export function normalizeAccount(account: string) {
  // Match the existing lower-case email contract; surrounding whitespace cannot
  // select a different budget. Do not fold provider-specific dots or plus aliases.
  const normalized = account.trim().toLowerCase();
  if (!normalized || normalized.length > 320) throw new Error("Invalid limiter identity");
  return normalized;
}

export function normalizeClient(address: string) {
  const ip = address.trim();
  const version = isIP(ip);
  if (version === 4) return ip;
  if (version !== 6 || ip.includes("%")) throw new Error("Invalid limiter identity");
  const canonical = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const [left, right] = canonical.split("::");
  const start = left ? left.split(":") : [];
  const end = right ? right.split(":") : [];
  const words = right !== undefined
    ? [...start, ...Array(8 - start.length - end.length).fill("0"), ...end]
    : start;
  const numbers = words.map((word) => parseInt(word, 16));
  if (numbers.slice(0, 5).every((word) => word === 0) && numbers[5] === 65535) {
    return [numbers[6] >> 8, numbers[6] & 255, numbers[7] >> 8, numbers[7] & 255].join(".");
  }
  // IPv6 privacy addresses within a /64 must share a client budget.
  return numbers.slice(0, 4).map((word) => word.toString(16).padStart(4, "0")).join(":") + "::/64";
}

export function trustedClient(request: Request) {
  // Only an ingress that strips caller values, sets this header itself, and
  // prevents direct origin access may opt in. No X-Forwarded-For fallback.
  if (process.env.AUTH_TRUSTED_PROXY_VERIFIED !== "true" ||
      process.env.AUTH_TRUSTED_CLIENT_HEADER !== "x-toprank-client-ip") {
    throw new Error("Trusted ingress is not configured");
  }
  return normalizeClient(request.headers.get("x-toprank-client-ip") ?? "");
}
