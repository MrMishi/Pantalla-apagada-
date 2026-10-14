import { registerPlugin } from '@capacitor/core';

export interface BlackoutOverlayPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<void>;
  startOverlayService(): Promise<{ success: boolean }>;
  stopOverlayService(): Promise<{ success: boolean }>;
}

const NativeBlackout = registerPlugin<BlackoutOverlayPlugin>('BlackoutOverlay');

export const nativeOverlayService = {
  async isAvailable(): Promise<boolean> {
    try {
      const res = await NativeBlackout.checkPermission();
      return typeof res?.granted === 'boolean';
    } catch {
      return false;
    }
  },

  async checkPermission(): Promise<boolean> {
    try {
      const res = await NativeBlackout.checkPermission();
      return !!res?.granted;
    } catch {
      return false;
    }
  },

  async requestPermission(): Promise<void> {
    try {
      await NativeBlackout.requestPermission();
    } catch (e) {
      console.warn('Native requestPermission not available', e);
    }
  },

  async startService(): Promise<boolean> {
    try {
      const res = await NativeBlackout.startOverlayService();
      return !!res?.success;
    } catch (e) {
      console.warn('Native startService not available', e);
      return false;
    }
  },

  async stopService(): Promise<boolean> {
    try {
      const res = await NativeBlackout.stopOverlayService();
      return !!res?.success;
    } catch (e) {
      console.warn('Native stopService not available', e);
      return false;
    }
  },
};
