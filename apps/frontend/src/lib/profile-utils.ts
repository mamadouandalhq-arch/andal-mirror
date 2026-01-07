interface User {
  city?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
}

/**
 * Checks if a user's profile is incomplete by verifying if any required address fields are missing
 * @param user - User object to check
 * @returns true if profile is incomplete (any address field is missing), false otherwise
 */
export function isProfileIncomplete(user: User | null): boolean {
  if (!user) return true;

  // Check required fields: city, street, building
  if (!user.city || !user.street || !user.building) {
    return true;
  }

  // Check if empty strings for required fields
  if (
    user.city.trim() === '' ||
    user.street.trim() === '' ||
    user.building.trim() === ''
  ) {
    return true;
  }

  // Apartment is optional - if it's null/undefined/empty, we assume it's a private house (OK)
  // The form validation will ensure apartment users fill it in
  // This allows users with private houses to have empty apartment field
  
  return false;
}

