// WakeLock controller to prevent device screen from going to sleep

class WakeLockManager {
  private sentinel: WakeLockSentinel | null = null;
  private isRequested = false;

  async request(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }
    try {
      this.isRequested = true;
      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch {
      return false;
    }
  }

  async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // Ignore
      }
      this.sentinel = null;
    }
  }

  isActive(): boolean {
    return this.sentinel !== null;
  }
}

export const wakeLockManager = new WakeLockManager();
