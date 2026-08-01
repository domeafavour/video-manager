import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { isAudio } from "@/utils/file-type";
import { toFileUrl } from "@/utils/file-url";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { PiecesPanel } from "./PiecesPanel";
import { TimeTagPanel } from "./TimeTagPanel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: number;
  resourcePath: string;
  initialTags: string[];
}

export function MediaPreviewDialog({
  open,
  onOpenChange,
  resourceId,
  resourcePath,
  initialTags,
}: Props) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const playbackEndRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isAudioPreview = isAudio(resourcePath);
  const isVideoPreview = !isAudioPreview;

  const getCurrentTime = () => playerRef.current?.currentTime ?? null;

  const seekTo = (time: number) => {
    const player = playerRef.current;
    if (player) player.currentTime = time;
  };

  // Play a range; the player auto-pauses when it reaches the end (see onTimeUpdate).
  const playRange = (start: number, end: number) => {
    const player = playerRef.current;
    if (!player) return;
    playbackEndRef.current = end;
    player.currentTime = start;
    player.play();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isAudioPreview ? "Audio Preview" : "Video Preview"}</DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            "flex-1 flex items-center justify-center bg-muted/30 rounded-md",
            !isAudioPreview && "overflow-hidden",
          )}
        >
          <ReactPlayer
            ref={playerRef}
            src={toFileUrl(resourcePath)}
            controls
            width="100%"
            height="100%"
            style={{ maxHeight: "100%" }}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime);
              if (
                playbackEndRef.current !== null &&
                e.currentTarget.currentTime >= playbackEndRef.current
              ) {
                e.currentTarget.pause();
                playbackEndRef.current = null;
              }
            }}
            onPause={() => {
              playbackEndRef.current = null;
            }}
          />
        </div>
        <div className="space-y-3 pt-3 border-t">
          <TimeTagPanel
            resourceId={resourceId}
            initialTags={initialTags}
            open={open}
            getCurrentTime={getCurrentTime}
            seekTo={seekTo}
          />
          {isVideoPreview && (
            <PiecesPanel
              resourceId={resourceId}
              resourcePath={resourcePath}
              open={open}
              currentTime={currentTime}
              duration={duration}
              getCurrentTime={getCurrentTime}
              playRange={playRange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
