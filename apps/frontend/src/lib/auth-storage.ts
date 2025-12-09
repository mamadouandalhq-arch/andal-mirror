// Store accessToken in memory and sessionStorage
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
    // Store in sessionStorage for persistence during session (cleared on tab close)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', token);
      this.notifyListeners();
    }
  }

  getAccessToken(): string | null {
    // Check sessionStorage first to ensure we have the latest value
    // This is important for useSyncExternalStore to work correctly
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        // Sync memory with sessionStorage
        this.accessToken = token;
        return token;
      }
    }
    // Clear memory if no token in sessionStorage
    this.accessToken = null;
    return null;
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      this.notifyListeners();
    }
  }
}

export const authStorage = new AuthStorage();
