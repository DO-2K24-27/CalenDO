import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback(() => {
    // Play the bell sound 3 times with proper sequential timing
    const playCount = 3;
    const interval = 800; // 800ms between each bell
    
    // Create a single audio context to reuse
    try {
      interface WindowWithWebkit extends Window {
        webkitAudioContext?: typeof AudioContext;
      }
      
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }
      
      const audioContext = new AudioContextClass();
      
      // Function to play a single bell with the shared context
      const playBell = (bellNumber: number) => {
        const sampleRate = audioContext.sampleRate;
        const duration = 1.5; // 1.5 seconds
        const frameCount = sampleRate * duration;
        
        // Create an audio buffer for a pleasant bell-like sound
        const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        // Generate a bell-like sound with multiple harmonics
        for (let i = 0; i < frameCount; i++) {
          const t = i / sampleRate;
          
          // Create a bell-like sound with multiple frequencies and decay
          const decay = Math.exp(-t * 3); // Exponential decay
          const fundamental = Math.sin(2 * Math.PI * 800 * t); // 800Hz base frequency
          const harmonic2 = Math.sin(2 * Math.PI * 1200 * t) * 0.3; // Second harmonic
          const harmonic3 = Math.sin(2 * Math.PI * 1600 * t) * 0.15; // Third harmonic
          
          // Combine harmonics with decay envelope
          channelData[i] = (fundamental + harmonic2 + harmonic3) * decay * 0.3;
        }
        
        // Play the generated sound
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
        console.log(`Break notification bell ${bellNumber} played`);
      };
      
      // Schedule each bell with proper timing
      for (let i = 0; i < playCount; i++) {
        setTimeout(() => {
          playBell(i + 1);
        }, i * interval);
      }
    } catch (error) {
      console.error('Error playing bell sequence:', error);
    }
  }, []);

  return { playSound };
};
