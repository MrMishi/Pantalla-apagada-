export type UnlockGesture = 'double_tap' | 'single_tap' | 'triple_tap' | 'long_press' | 'swipe_up';

export type BubblePosition = {
  x: number;
  y: number;
};

export type SimulatedApp = 'music' | 'video' | 'game' | 'dashboard';

export interface BlackoutConfig {
  opacity: number; // 0.85 to 1.0 (pure black)
  brightnessLevel: number; // 0.0 to 0.1 (simulated minimum light)
  unlockGesture: UnlockGesture;
  showAodClock: boolean;
  soundFeedback: boolean;
  vibrationFeedback: boolean;
  bubbleSize: 'sm' | 'md' | 'lg';
  bubbleIcon: 'power' | 'moon' | 'shield' | 'eye';
  keepScreenOn: boolean;
}

export interface AndroidCodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
