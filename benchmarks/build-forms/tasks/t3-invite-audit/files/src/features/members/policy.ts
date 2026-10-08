const PERSONAL_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com"]

/**
 * Business Logic: Invites go to work addresses only.
 * Why: Seats are billed per verified company domain.
 */
export function isPersonalEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase()
  return domain !== undefined && PERSONAL_EMAIL_DOMAINS.includes(domain)
}
