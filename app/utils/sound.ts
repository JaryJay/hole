const audioCache: Record<string, HTMLAudioElement> = {};

export const playSound = (soundPath: string, volume = 1.0) => {
  // Check if we already have this sound in cache
  if (!audioCache[soundPath]) {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audioCache[soundPath] = audio;
    } catch (error) {
      console.error('Error loading sound:', error);
      return;
    }
  }

  // Clone the audio element to allow multiple overlapping plays
  const audio = audioCache[soundPath].cloneNode(true) as HTMLAudioElement;
  audio.volume = volume;
  
  // Play the sound
  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });

  // Clean up the audio element after it finishes playing
  audio.addEventListener('ended', () => {
    audio.remove();
  });
};
