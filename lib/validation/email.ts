/**
 * Strict email validation, typo detection, and disposable domain blocklist.
 * Designed for both client and server usage (no Node.js-only builtins).
 */

export const POPULAR_EMAIL_PROVIDERS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "zoho.com",
  "fastmail.com",
  "mail.com",
  "yandex.com",
] as const;

export const BRANDED_PROVIDER_SUFFIXES = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "rocketmail.com",
  "yandex.com",
] as const;

export const POPULAR_PROVIDER_ROOTS = [
  "gmail",
  "googlemail",
  "yahoo",
  "outlook",
  "hotmail",
  "icloud",
  "live",
  "msn",
  "aol",
  "proton",
  "protonmail",
  "zoho",
  "fastmail",
  "yandex",
] as const;

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "burnermail.io",
  "crazymailing.com",
  "disposablemail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakemail.net",
  "fakemailgenerator.com",
  "getairmail.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.block",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "inboxkitten.com",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "minutemail.com",
  "mohmal.com",
  "mytrashmail.com",
  "nada.ltd",
  "sharklasers.com",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

/**
 * Computes Damerau-Levenshtein distance (insertions, deletions, substitutions, and adjacent transpositions).
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost); // transposition
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Checks if a domain belongs to a known disposable / burner inbox provider.
 */
export function isDisposableEmailDomain(domain: string): boolean {
  const lower = domain.trim().toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.has(lower);
}

/**
 * Detects common typos and misspellings of major email providers.
 */
export function detectDomainTypo(domain: string): {
  isTypo: boolean;
  suggestedDomain?: string;
} {
  const lower = domain.trim().toLowerCase();

  // If already an exact popular provider, not a typo
  if ((POPULAR_EMAIL_PROVIDERS as readonly string[]).includes(lower)) {
    return { isTypo: false };
  }

  // 1. Suffix match on distinct branded providers with leading extra/repeated characters (e.g. kkkkgmail.com, ggmail.com, yyahoo.com)
  for (const provider of BRANDED_PROVIDER_SUFFIXES) {
    if (lower.endsWith(provider) && lower !== provider) {
      return { isTypo: true, suggestedDomain: provider };
    }
  }

  // 2. Split domain into name and TLD parts
  const parts = lower.split(".");
  if (parts.length >= 2) {
    const rootName = parts[0];
    const tld = parts.slice(1).join(".");

    // Check if root name is a known branded provider root with leading/trailing junk
    // e.g. "kkkkgmail.com" -> rootName "kkkkgmail" ending in "gmail"
    for (const root of POPULAR_PROVIDER_ROOTS) {
      if (
        root !== "fastmail" &&
        rootName.endsWith(root) &&
        rootName !== root
      ) {
        const canonicalProvider =
          root === "proton"
            ? "proton.me"
            : root === "googlemail"
            ? "googlemail.com"
            : `${root}.com`;
        return { isTypo: true, suggestedDomain: canonicalProvider };
      }
    }

    // Common TLD typos for popular providers (e.g. gmail.con -> gmail.com, yahoo.co -> yahoo.com)
    const commonTldTypos: Record<string, string> = {
      con: "com",
      comm: "com",
      cmo: "com",
      cm: "com",
      ocm: "com",
      vom: "com",
      xom: "com",
      og: "org",
      ogr: "org",
      orrg: "org",
      nte: "net",
      met: "net",
    };

    if (tld in commonTldTypos) {
      const fixedTld = commonTldTypos[tld];
      const candidateDomain = `${rootName}.${fixedTld}`;
      if ((POPULAR_EMAIL_PROVIDERS as readonly string[]).includes(candidateDomain)) {
        return { isTypo: true, suggestedDomain: candidateDomain };
      }
    }

    // Check Levenshtein distance on rootName if TLD is standard (com, org, net, me)
    for (const provider of POPULAR_EMAIL_PROVIDERS) {
      const [provRoot, provTld] = provider.split(".");
      if (tld === provTld) {
        const dist = damerauLevenshtein(rootName, provRoot);
        // Distance 1 for roots >= 4 chars (e.g. gamil vs gmail), distance 2 for roots >= 6 chars (e.g. outlok vs outlook, hotmial vs hotmail)
        if (
          (dist === 1 && provRoot.length >= 4) ||
          (dist === 2 && provRoot.length >= 6)
        ) {
          return { isTypo: true, suggestedDomain: provider };
        }
      }
    }
  }

  // 3. Full domain edit distance check
  for (const provider of POPULAR_EMAIL_PROVIDERS) {
    const dist = damerauLevenshtein(lower, provider);
    if (dist === 1 || (dist === 2 && provider.length >= 9)) {
      return { isTypo: true, suggestedDomain: provider };
    }
  }

  return { isTypo: false };
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
  normalizedEmail?: string;
  domain?: string;
  localPart?: string;
}

/**
 * Validates email format, length, domain structure, disposable domains, and typos.
 */
export function validateEmailFormat(rawEmail: string): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== "string") {
    return { valid: false, error: "Please enter an email address." };
  }

  const trimmed = rawEmail.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Please enter an email address." };
  }

  if (trimmed.length > 255) {
    return { valid: false, error: "Email address cannot exceed 255 characters." };
  }

  // Must contain exactly one '@'
  const atIndex = trimmed.indexOf("@");
  if (atIndex === -1 || atIndex !== trimmed.lastIndexOf("@")) {
    return { valid: false, error: "Please enter a valid email address with a single '@'." };
  }

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1).toLowerCase();

  // Local part validation (1 to 64 chars)
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: "Email username must be between 1 and 64 characters." };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { valid: false, error: "Email username cannot start or end with a dot." };
  }

  if (localPart.includes("..")) {
    return { valid: false, error: "Email username cannot contain consecutive dots." };
  }

  // Local part character check
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localPartRegex.test(localPart)) {
    return { valid: false, error: "Email username contains invalid characters." };
  }

  // Domain validation (1 to 255 chars)
  if (domainPart.length === 0 || domainPart.length > 255) {
    return { valid: false, error: "Please enter a valid domain name." };
  }

  if (!domainPart.includes(".")) {
    return { valid: false, error: "Email domain must include a top-level extension (e.g. .com)." };
  }

  const domainLabels = domainPart.split(".");
  const tld = domainLabels[domainLabels.length - 1];

  // TLD must be alphabetical and at least 2 characters long
  const tldRegex = /^[a-zA-Z]{2,}$/;
  if (!tldRegex.test(tld)) {
    return { valid: false, error: "Email domain extension must be at least 2 letters (e.g. .com)." };
  }

  // Domain labels check (alphanumeric and hyphens, no leading/trailing hyphen, 1-63 chars)
  const labelRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  for (const label of domainLabels) {
    if (!label || !labelRegex.test(label)) {
      return { valid: false, error: "Email domain contains invalid labels or characters." };
    }
  }

  // Disposable domain blocklist check
  if (isDisposableEmailDomain(domainPart)) {
    return {
      valid: false,
      error: "Disposable and temporary email addresses are not accepted.",
    };
  }

  // Typo check
  const typoCheck = detectDomainTypo(domainPart);
  if (typoCheck.isTypo && typoCheck.suggestedDomain) {
    return {
      valid: false,
      error: `Invalid email domain. Did you mean @${typoCheck.suggestedDomain}?`,
      suggestion: typoCheck.suggestedDomain,
      domain: domainPart,
      localPart,
    };
  }

  return {
    valid: true,
    normalizedEmail: `${localPart}@${domainPart}`,
    domain: domainPart,
    localPart,
  };
}
