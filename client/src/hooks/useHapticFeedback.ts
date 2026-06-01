import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  // バイブレーションパターンの定義
  const patterns: Record<HapticPattern, number[]> = {
    light: [10],
    medium: [20],
    heavy: [50],
    success: [10, 20, 10],
    warning: [30, 30, 30],
    error: [50, 30, 50],
  };

  // バイブレーション実行
  const vibrate = useCallback((pattern: HapticPattern | number[]) => {
    if (!navigator.vibrate) {
      console.warn('Vibration API is not supported');
      return;
    }

    const vibrationPattern = typeof pattern === 'string' ? patterns[pattern] : pattern;
    navigator.vibrate(vibrationPattern);
  }, []);

  // 波紋通知用バイブレーション
  const rippleVibration = useCallback(() => {
    vibrate('light');
  }, [vibrate]);

  // 成功通知用バイブレーション
  const successVibration = useCallback(() => {
    vibrate('success');
  }, [vibrate]);

  // エラー通知用バイブレーション
  const errorVibration = useCallback(() => {
    vibrate('error');
  }, [vibrate]);

  // バイブレーション停止
  const stop = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  }, []);

  return {
    vibrate,
    rippleVibration,
    successVibration,
    errorVibration,
    stop,
  };
}

// 音声フィードバック用ユーティリティ
export function playNotificationSound(type: 'ripple' | 'success' | 'error' | 'message') {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 音声パターンの定義
  const patterns = {
    ripple: { frequency: 800, duration: 100 },
    success: { frequency: 1000, duration: 200 },
    error: { frequency: 400, duration: 300 },
    message: { frequency: 600, duration: 150 },
  };

  const pattern = patterns[type];
  oscillator.frequency.value = pattern.frequency;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + pattern.duration / 1000);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + pattern.duration / 1000);
}

// 複合フィードバック（バイブレーション + 音声）
export function playHapticAndAudio(type: 'ripple' | 'success' | 'error' | 'message') {
  const { vibrate } = useHapticFeedback();

  const feedbackPatterns = {
    ripple: { haptic: 'light' as HapticPattern, audio: 'ripple' as const },
    success: { haptic: 'success' as HapticPattern, audio: 'success' as const },
    error: { haptic: 'error' as HapticPattern, audio: 'error' as const },
    message: { haptic: 'medium' as HapticPattern, audio: 'message' as const },
  };

  const pattern = feedbackPatterns[type];
  vibrate(pattern.haptic);
  playNotificationSound(pattern.audio);
}
