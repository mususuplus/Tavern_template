import { useEffect, useRef, useState } from 'react';

export function useFullscreenAudio(playlist: Array<{ name: string; url: string }>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullClock, setShowFullClock] = useState(false);

  const toggleFullscreen = () => {
    const element = mainContainerRef.current ?? document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleTrackClick = (index: number) => {
    if (!audioRef.current) return;
    const track = playlist[index];
    if (!track) return;
    if (currentTrackIndex === index && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }
    audioRef.current.src = track.url;
    audioRef.current.play().catch(() => {});
    setCurrentTrackIndex(index);
    setIsMusicPlaying(true);
  };

  return {
    audioRef,
    mainContainerRef,
    currentTrackIndex,
    isMusicPlaying,
    isFullscreen,
    showFullClock,
    setShowFullClock,
    toggleFullscreen,
    handleTrackClick,
    setIsMusicPlaying,
  };
}
