/**
 * Authentication & Authorization Utilities (Client)
 * Single Source of Truth for Super Admin authorization and credential checking.
 */

export const SUPER_ADMIN_EMAILS = [
  'pasitpukang1234567@gmail.com',
  'psitpukang1234567@gmail.com',
  'apsitpukang1234567@gmail.com'
] as const

/**
 * Checks if the provided email belongs to a designated Super Admin.
 * Handles null/undefined and performs whitespace trimming and case-insensitive comparison.
 */
export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return SUPER_ADMIN_EMAILS.some((adminEmail) => clean === adminEmail)
}
