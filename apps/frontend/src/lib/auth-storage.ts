// Store accessToken in memory and localStorage
// RefreshToken is stored in httpOnly cookies by backend

class AuthStorage {
  private accessToken: string | null = null;

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      // Dispatch custom event to notify subscribers
      window.dispatchEvent(new Event('auth-storage-change'));
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    // Store in localStorage for persistence across tabs and sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      this.notifyListeners();
    }
  }

  getAccessToken(): string | null {
    // Check localStorage first to ensure we have the latest value
    // This is important for useSyncExternalStore to work correctly
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Sync memory with localStorage
        this.accessToken = token;
        return token;
      }
    }
    // Clear memory if no token in localStorage
    this.accessToken = null;
    return null;
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      this.notifyListeners();
    }
  }
}

export const authStorage = new AuthStorage();
