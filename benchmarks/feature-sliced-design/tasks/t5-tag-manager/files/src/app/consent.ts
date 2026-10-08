const storageKey = "acme-consent"

type Consent = { analytics: boolean }

const listeners = new Set<(consent: Consent) => void>()

export function readConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as Consent) : { analytics: false }
  } catch {
    return { analytics: false }
  }
}

export function hasAnalyticsConsent() {
  return readConsent().analytics
}

/** Called by the cookie banner. */
export function saveConsent(consent: Consent) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(consent))
  } catch {
    // Storage can be unavailable in private mode; keep the in-memory event.
  }
  listeners.forEach((listener) => listener(consent))
}

export function onConsentChange(listener: (consent: Consent) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
