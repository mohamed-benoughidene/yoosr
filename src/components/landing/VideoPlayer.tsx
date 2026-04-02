"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus, Volume2, VolumeX } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
} from "media-chrome/react";
import type { ComponentProps } from "react";
import React, { useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = ({
  className,
  ...props
}: VideoPlayerContentProps) => (
  <video className={cn("mb-0 mt-0", className)} {...props} />
);

interface LandingVideoProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  priority?: boolean; // Load immediately if true
}

export function LandingVideo({
  src,
  poster,
  autoPlay = true,
  showControls = false,
  priority = false,
}: LandingVideoProps) {
  const [showVideoPopOver, setShowVideoPopOver] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(priority);
  const videoRef = useRef<HTMLDivElement>(null);

  // Lazy load video when in viewport
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before entering viewport
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  if (showControls) {
    return (
      <div ref={videoRef} className="relative aspect-video w-full">
        {isInView ? (
          <MediaController>
            <VideoPlayerContent
              src={src}
              autoPlay={autoPlay}
              muted={isMuted}
              playsInline
              loop
              slot="media"
              className="w-full h-full object-cover"
              poster={poster}
              preload="metadata"
            />
            <span
              onClick={() => setIsMuted(!isMuted)}
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
            >
              {isMuted ? (
                <VolumeX className="size-5 text-white" />
              ) : (
                <Volume2 className="size-5 text-white" />
              )}
            </span>
            <MediaControlBar className="absolute bottom-0 left-0 flex w-full items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
              <MediaPlayButton className="h-5 w-5 bg-transparent text-white" />
              <MediaTimeRange className="flex-1 bg-transparent" />
              <MediaTimeDisplay className="text-white text-sm" />
              <MediaMuteButton className="h-5 w-5 bg-transparent text-white" />
            </MediaControlBar>
          </MediaController>
        ) : (
          // Placeholder while loading
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <div className="animate-pulse text-neutral-500">Loading video...</div>
          </div>
        )}
      </div>
    );
  }

  // Hero section style - autoplay without controls
  return (
    <>
      <AnimatePresence>
        {showVideoPopOver && (
          <VideoPopOver
            src={src}
            setShowVideoPopOver={setShowVideoPopOver}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        )}
      </AnimatePresence>
      <div
        ref={videoRef}
        onClick={() => setShowVideoPopOver(true)}
        className="relative h-full w-full cursor-pointer"
      >
        {isInView ? (
          <>
            <video
              autoPlay={autoPlay}
              muted={isMuted}
              playsInline
              loop
              className="h-full w-full object-cover"
              poster={poster}
              preload="metadata"
            >
              <source src={src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Play overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Play className="size-4 fill-white" /> Click to expand
              </div>
            </div>
          </>
        ) : (
          // Placeholder while loading
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <div className="animate-pulse text-neutral-500">Loading video...</div>
          </div>
        )}
      </div>
    </>
  );
}

const VideoPopOver = ({
  src,
  setShowVideoPopOver,
  isMuted,
  setIsMuted,
}: {
  src: string;
  setShowVideoPopOver: (show: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}) => {
  return (
    <div className="fixed left-0 top-0 z-[100] flex h-screen w-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-background/90 absolute left-0 top-0 h-full w-full backdrop-blur-lg"
        onClick={() => setShowVideoPopOver(false)}
      />
      <motion.div
        initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5%)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
        exit={{
          clipPath: "inset(43.5% 43.5% 33.5% 43.5%)",
          opacity: 0,
          transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.2, delay: 0.8 },
          },
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        className="relative aspect-video max-w-7xl px-4"
      >
        <MediaController>
          <VideoPlayerContent
            src={src}
            autoPlay
            muted={isMuted}
            slot="media"
            className="w-full h-full object-cover rounded-lg"
          />

          <span
            onClick={() => setShowVideoPopOver(false)}
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
          >
            <Plus className="size-5 rotate-45 text-white" />
          </span>

          <span
            onClick={() => setIsMuted(!isMuted)}
            className="absolute right-14 top-4 z-10 cursor-pointer rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
          >
            {isMuted ? (
              <VolumeX className="size-5 text-white" />
            ) : (
              <Volume2 className="size-5 text-white" />
            )}
          </span>

          <MediaControlBar className="absolute bottom-0 left-0 flex w-full items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-6 py-4 rounded-b-lg">
            <MediaPlayButton className="h-6 w-6 bg-transparent text-white" />
            <MediaTimeRange className="flex-1 bg-transparent" />
            <MediaTimeDisplay className="text-white text-sm font-mono" />
            <MediaMuteButton className="h-6 w-6 bg-transparent text-white" />
          </MediaControlBar>
        </MediaController>
      </motion.div>
    </div>
  );
};
