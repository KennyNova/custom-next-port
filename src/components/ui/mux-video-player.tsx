'use client';

import MuxPlayer from '@mux/mux-player-react';
import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface MuxVideoPlayerProps {
  playbackId: string;
  orientation: 'vertical' | 'horizontal';
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  showControls?: boolean;
}

export function MuxVideoPlayer({
  playbackId,
  orientation,
  title,
  poster,
  autoPlay = false,
  muted = true,
  className = '',
  showControls = true,
}: MuxVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showCustomControls, setShowCustomControls] = useState(false);

  // Use aspect ratio class only if no custom className is provided that might override sizing
  const aspectRatioClass = className.includes('w-full h-full') ? '' : (orientation === 'vertical' 
    ? 'aspect-[9/16]' 
    : 'aspect-video');

  return (
    <motion.div 
      className={`relative ${aspectRatioClass} ${className} group overflow-hidden rounded-lg bg-black`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setShowCustomControls(true)}
      onHoverEnd={() => setShowCustomControls(false)}
    >
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_title: title,
        }}
        autoPlay={autoPlay ? 'muted' : false}
        muted={isMuted}
        poster={poster}
        style={{
          width: '100%',
          height: '100%',
          objectFit: orientation === 'vertical' ? 'contain' : 'cover',
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full"
        ref={playerRef}
      />
      
      {/* Custom overlay controls (optional) */}
      {showControls && (
        <motion.div 
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
            showCustomControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: showCustomControls || !isPlaying ? 1 : 0 }}
        >
          {!isPlaying && (
            <motion.button
              type="button"
              className="bg-white/90 backdrop-blur-sm rounded-full p-4 cursor-pointer hover:bg-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                try {
                  if (playerRef.current) {
                    playerRef.current.play?.();
                  }
                } catch {}
              }}
            >
              <Play className="h-8 w-8 text-black ml-1" />
            </motion.button>
          )}
        </motion.div>
      )}
      
      {/* Video info overlay */}
      <motion.div 
        className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showCustomControls ? 1 : 0, y: showCustomControls ? 0 : -10 }}
        transition={{ duration: 0.2 }}
      >
        <span className="capitalize">{orientation}</span>
      </motion.div>
      
      {/* Muted indicator */}
      <motion.button
        type="button"
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsMuted(m => !m)}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </motion.button>
    </motion.div>
  );
}

// Skeleton loader for video player
export function MuxVideoPlayerSkeleton({ orientation, className = '' }: { 
  orientation: 'vertical' | 'horizontal';
  className?: string;
}) {
  const aspectRatioClass = orientation === 'vertical' 
    ? 'aspect-[9/16]' 
    : 'aspect-video';

  return (
    <div className={`${aspectRatioClass} ${className} bg-gray-200 rounded-lg animate-pulse overflow-hidden`}>
      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
        <div className="bg-white/20 rounded-full p-4">
          <Play className="h-8 w-8 text-white/50" />
        </div>
      </div>
    </div>
  );
}
