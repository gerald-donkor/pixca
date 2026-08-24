import dns from "node:dns/promises";

export interface DnsVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verifies that a domain has valid MX or fallback A records using Node.js DNS promises.
 * Handles RFC 7505 Null MX records and includes timeout safeguards.
 */
export async function verifyEmailDomainDns(
  domain: string,
  timeoutMs = 3500
): Promise<DnsVerificationResult> {
  const normalizedDomain = domain.trim().toLowerCase();

  // Basic sanity check
  if (!normalizedDomain || !normalizedDomain.includes(".")) {
    return {
      valid: false,
      error: `The domain '${domain}' is invalid.`,
    };
  }

  // Create an abortable timeout promise
  const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) => {
    const timer = setTimeout(() => resolve({ isTimeout: true }), timeoutMs);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  });

  const lookupPromise = (async (): Promise<DnsVerificationResult> => {
    try {
      // 1. Try MX record resolution
      const mxRecords = await dns.resolveMx(normalizedDomain);
      if (mxRecords && mxRecords.length > 0) {
        // RFC 7505 Null MX check: domain explicitly does not accept email (e.g. exchange = "." or "")
        const isNullMx = mxRecords.some(
          (mx) => !mx.exchange || mx.exchange === "." || mx.exchange === ""
        );
        if (isNullMx) {
          return {
            valid: false,
            error: `The domain '${domain}' explicitly does not accept email.`,
          };
        }

        return { valid: true };
      }
    } catch (mxErr: unknown) {
      const err = mxErr as { code?: string; message?: string };
      // If error indicates domain does not exist or has no MX records
      if (
        err.code === "ENOTFOUND" ||
        err.code === "ENODATA" ||
        err.code === "SERVFAIL" ||
        err.code === "NXDOMAIN" ||
        err.code === "NOTFOUND"
      ) {
        // Fallback: Check if an A record exists for the domain (RFC 5321 implicit MX fallback)
        try {
          const aRecords = await dns.resolve4(normalizedDomain);
          if (aRecords && aRecords.length > 0) {
            return { valid: true };
          }
        } catch (aErr: unknown) {
          const aErrCode = (aErr as { code?: string })?.code;
          if (
            aErrCode === "ENOTFOUND" ||
            aErrCode === "ENODATA" ||
            aErrCode === "SERVFAIL" ||
            aErrCode === "NXDOMAIN" ||
            aErrCode === "NOTFOUND"
          ) {
            return {
              valid: false,
              error: `The domain '${domain}' does not exist or cannot receive email.`,
            };
          }
          // Network resolution failure / offline fallback
          console.warn("[DNS Verification] A lookup fallback warning:", aErr);
          return { valid: true };
        }
      } else {
        // Transient network error (e.g. EAI_AGAIN, ECONNREFUSED)
        console.warn("[DNS Verification] MX lookup warning:", mxErr);
        return { valid: true };
      }
    }

    // Fallback if resolveMx returned empty array without throwing
    try {
      const aRecords = await dns.resolve4(normalizedDomain);
      if (aRecords && aRecords.length > 0) {
        return { valid: true };
      }
    } catch {
      return {
        valid: false,
        error: `The domain '${domain}' does not exist or cannot receive email.`,
      };
    }

    return { valid: true };
  })();

  const result = await Promise.race([lookupPromise, timeoutPromise]);
  if ("isTimeout" in result) {
    console.warn(`[DNS Verification] DNS lookup timed out for domain: ${domain}`);
    // Safe fallback so transient slow DNS does not block legitimate users
    return { valid: true };
  }

  return result;
}
