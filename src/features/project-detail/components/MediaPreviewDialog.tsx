import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { resources } from "@/services/resources";
import { clips } from "@/services/clips";
import { ClipEntity } from "@/typings";
import { toast } from "sonner";
import { formatTime, isTimeTag, parseTimeFromTag, createTimeTag } from "@/utils/time-tag";
import { isAudio } from "@/utils/file-type";
import { toFileUrl } from "@/utils/file-url";
import { Loader2, Play, Plus, Scissors, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ReactPlayer from "react-player";

const SEGMENT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

function pct(seconds: number, duration: number) {
  return Math.min(100, Math.max(0, (seconds / duration) * 100));
}

type ExportResult =
  | { success: true; outputPath: string; size: number }
  | { success: false; error: string }
  | { canceled: true };

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
  const isAudioPreview = isAudio(resourcePath);
  const isVideoPreview = !isAudioPreview;
  const playbackEndRef = useRef<number | null>(null);
  const wasOpenRef = useRef(false);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [tagInput, setTagInput] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inTime, setInTime] = useState<number | null>(null);
  const [outTime, setOutTime] = useState<number | null>(null);
  const [clipName, setClipName] = useState("");
  const [exportingId, setExportingId] = useState<number | null>(null);

  const { mutate: updateTags } = resources.updateTags.useMutation({
    onSuccess: () => {
      // Tags updated successfully
    },
  });
  const { data: pieces } = clips.list.useQuery({
    variables: resourceId,
    enabled: open && isVideoPreview,
  });
  const { mutate: saveClip } = clips.save.useMutation({
    onSuccess: () => toast.success("Piece added"),
    onError: () => toast.error("Failed to add piece"),
  });
  const { mutate: deleteClip } = clips.delete.useMutation({
    onSuccess: () => toast.success("Piece removed"),
    onError: () => toast.error("Failed to remove piece"),
  });
  const { mutate: createMaterial } = resources.create.useMutation({
    onSuccess: () => toast.success("Added to project"),
    onError: () => toast.error("Failed to add to project"),
  });

  useEffect(() => {
    if (open) {
      setTags(initialTags || []);
      setTagInput("");
    }
  }, [open, initialTags]);

  // Reset piece-marking state only on a fresh open (not on initialTags changes,
  // which fire when tags are saved while the dialog stays open).
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setInTime(null);
      setOutTime(null);
      setClipName("");
      setCurrentTime(0);
      setDuration(0);
      playbackEndRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open]);

  const handleAddTimeTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.currentTime;
    const timeTag = createTimeTag(currentTime, trimmed);

    if (!tags.includes(timeTag)) {
      const newTags = [...tags, timeTag];
      setTags(newTags);
      updateTags({ id: resourceId, tags: newTags });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    updateTags({ id: resourceId, tags: newTags });
  };

  const handleTagClick = (tag: string) => {
    if (!isTimeTag(tag)) return;

    const time = parseTimeFromTag(tag);
    if (time !== null && playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTimeTag();
    }
  };

  const handleSetIn = () => {
    const player = playerRef.current;
    if (player) setInTime(player.currentTime);
  };

  const handleSetOut = () => {
    const player = playerRef.current;
    if (player) setOutTime(player.currentTime);
  };

  const handleAddPiece = () => {
    const trimmed = clipName.trim();
    if (!trimmed || inTime === null || outTime === null) return;
    if (outTime <= inTime) {
      toast.error("Out must be after In");
      return;
    }
    saveClip({ materialId: resourceId, name: trimmed, start: inTime, end: outTime });
    setClipName("");
    setInTime(null);
    setOutTime(null);
  };

  const handlePlayPiece = (piece: ClipEntity) => {
    const player = playerRef.current;
    if (!player) return;
    playbackEndRef.current = piece.end;
    player.currentTime = piece.start;
    player.play();
  };

  // Cross-platform basename (Windows paths use "\"). Avoids node:path in the
  // renderer; the main process already resolves real paths via its own path.
  const basename = (p: string) => p.split(/[\\/]/).pop() ?? p;

  const exportFileName = (sourcePath: string, pieceName: string) => {
    const base = basename(sourcePath).replace(/\.\w+$/, "");
    const safe = pieceName.replace(/[\\/]/g, "-");
    const ext = (sourcePath.match(/\.(\w+)$/) ?? [])[1] || "mp4";
    return `${base}-${safe}.${ext}`;
  };

  const handleExport = async (piece: ClipEntity) => {
    setExportingId(piece.id);
    try {
      const res = (await window.ipcRenderer.invoke("app:export-clip", {
        inputPath: resourcePath,
        start: piece.start,
        end: piece.end,
        defaultFileName: exportFileName(resourcePath, piece.name),
      })) as ExportResult;
      if ("canceled" in res) return;
      if (!res.success) {
        toast.error(res.error || "Export failed");
        return;
      }
      if (window.confirm(`Exported to ${res.outputPath}. Add it to the project?`)) {
        const source = await db.getMaterial(resourceId);
        if (!source) {
          toast.error("Source material no longer exists");
          return;
        }
        createMaterial({
          projectId: source.projectId,
          name: basename(res.outputPath),
          path: res.outputPath,
          size: res.size,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingId(null);
    }
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
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add note at current time..."
              className="flex-1"
            />
            <Button onClick={handleAddTimeTag} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Tag
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-md border border-border">
              {tags.map((tag) => {
                const isTime = isTimeTag(tag);
                return (
                  <div
                    key={tag}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-sm text-sm group border border-border",
                      isTime
                        ? "bg-chart-3/20 text-chart-3 cursor-pointer hover:bg-chart-3/30"
                        : "bg-primary/15 text-primary"
                    )}
                    onClick={() => handleTagClick(tag)}
                  >
                    <span className={isTime ? "font-mono" : ""}>{tag}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {isVideoPreview && (
            <div className="flex flex-col md:flex-row gap-4 pt-3 border-t">
              <div className="flex-1 space-y-3 min-w-0">
                {duration > 0 && (
                  <div className="relative h-10 rounded-md bg-muted/70 border border-border">
                    {inTime !== null && outTime !== null && outTime > inTime && (
                      <div
                        className="absolute inset-y-0 bg-chart-3/20 border-x-2 border-chart-3/60"
                        style={{
                          left: `${pct(inTime, duration)}%`,
                          width: `${pct(outTime, duration) - pct(inTime, duration)}%`,
                        }}
                      />
                    )}
                    {pieces?.map((piece, i) => (
                      <div
                        key={piece.id}
                        title={`${piece.name} · ${formatTime(piece.start)}–${formatTime(piece.end)}`}
                        onClick={() => handlePlayPiece(piece)}
                        className={cn(
                          "absolute inset-y-0 opacity-80 hover:opacity-100 cursor-pointer",
                          SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                        )}
                        style={{
                          left: `${pct(piece.start, duration)}%`,
                          width: `${pct(piece.end, duration) - pct(piece.start, duration)}%`,
                        }}
                      />
                    ))}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-foreground/80"
                      style={{ left: `${pct(currentTime, duration)}%` }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleSetIn}>
                    Set In
                    {inTime !== null && (
                      <span className="ml-1 font-mono text-xs">{formatTime(inTime)}</span>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSetOut}>
                    Set Out
                    {outTime !== null && (
                      <span className="ml-1 font-mono text-xs">{formatTime(outTime)}</span>
                    )}
                  </Button>
                  <Input
                    value={clipName}
                    onChange={(e) => setClipName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddPiece();
                    }}
                    placeholder="Piece name"
                    className="flex-1 min-w-32 h-8 text-sm"
                  />
                  <Button size="sm" onClick={handleAddPiece}>
                    <Scissors className="w-3.5 h-3.5 mr-1" />
                    Split
                  </Button>
                </div>
              </div>

              <div className="md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Pieces</h3>
                  <span className="text-xs text-muted-foreground">{pieces?.length ?? 0}</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pieces?.map((piece, i) => (
                    <div key={piece.id} className="rounded-md border border-border overflow-hidden">
                      <div
                        className={cn(
                          "h-9 flex items-center justify-center text-card-foreground/80",
                          SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                        )}
                      >
                        <span className="text-xs font-medium truncate px-2">{piece.name}</span>
                      </div>
                      <div className="px-2 py-1.5 flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">
                          {formatTime(piece.start)}–{formatTime(piece.end)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePlayPiece(piece)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExport(piece)}
                            disabled={exportingId !== null}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Export"
                          >
                            {exportingId === piece.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteClip({ id: piece.id })}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!pieces || pieces.length === 0) && (
                    <p className="text-xs text-muted-foreground">No pieces yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
