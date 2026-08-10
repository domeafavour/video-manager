import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { clips } from "@/services/clips";
import { resources } from "@/services/resources";
import { ClipEntity } from "@/typings";
import { formatTime } from "@/utils/time-tag";
import { Loader2, Play, Scissors, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SEGMENT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

function pct(seconds: number, duration: number) {
  return Math.min(100, Math.max(0, (seconds / duration) * 100));
}

type ExportResult =
  | { success: true; outputPath: string; size: number }
  | { success: false; error: string }
  | { canceled: true };

function PieceTimeline({
  time,
  duration,
  inTime,
  outTime,
  pieces,
  onSelect,
  onSeek,
}: {
  time: number;
  duration: number;
  inTime: number | null;
  outTime: number | null;
  pieces: ClipEntity[];
  onSelect: (piece: ClipEntity) => void;
  onSeek: (time: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const timeFromEvent = (clientX: number) => {
    const el = ref.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const pctX = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return pctX * duration;
  };

  const seekFromEvent = (clientX: number) => {
    const t = timeFromEvent(clientX);
    if (t !== null) {
      onSeek(t);
      setScrubTime(t);
    }
  };

  if (duration <= 0) return null;
  return (
    <div
      ref={ref}
      className="relative h-10 rounded-md bg-muted/70 border border-border cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        seekFromEvent(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) seekFromEvent(e.clientX);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
        setScrubTime(null);
      }}
    >
      {inTime !== null && outTime !== null && outTime > inTime && (
        <div
          className="absolute inset-y-0 bg-chart-3/20 border-x-2 border-chart-3/60"
          style={{
            left: `${pct(inTime, duration)}%`,
            width: `${pct(outTime, duration) - pct(inTime, duration)}%`,
          }}
        />
      )}
      {pieces.map((piece, i) => (
        <div
          key={piece.id}
          title={`${piece.name} · ${formatTime(piece.start)}–${formatTime(piece.end)}`}
          onClick={() => onSelect(piece)}
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
        style={{ left: `${pct(scrubTime ?? time, duration)}%` }}
      />
    </div>
  );
}

function PieceCard({
  piece,
  index,
  exportingId,
  onPlay,
  onExport,
  onRemove,
}: {
  piece: ClipEntity;
  index: number;
  exportingId: number | null;
  onPlay: (piece: ClipEntity) => void;
  onExport: (piece: ClipEntity) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div
        className={cn(
          "h-9 flex items-center justify-center text-card-foreground/80",
          SEGMENT_COLORS[index % SEGMENT_COLORS.length],
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
            onClick={() => onPlay(piece)}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onExport(piece)}
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
            onClick={() => onRemove(piece.id)}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface PiecesPanelProps {
  resourceId: number;
  open: boolean;
  currentTime: number;
  duration: number;
  getCurrentTime: () => number | null;
  playRange: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export function PiecesPanel({
  resourceId,
  open,
  currentTime,
  duration,
  getCurrentTime,
  playRange,
  onSeek,
}: PiecesPanelProps) {
  const wasOpenRef = useRef(false);
  const [inTime, setInTime] = useState<number | null>(null);
  const [outTime, setOutTime] = useState<number | null>(null);
  const [clipName, setClipName] = useState("");

  const { data: pieces } = clips.list.useQuery({ variables: resourceId, enabled: open });
  const { mutate: saveClip } = clips.save.useMutation({
    onSuccess: () => toast.success("Piece added"),
    onError: () => toast.error("Failed to add piece"),
  });

  // Reset piece-marking state only on a fresh open.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setInTime(null);
      setOutTime(null);
      setClipName("");
    }
    wasOpenRef.current = open;
  }, [open]);

  const handleSetIn = () => {
    const t = getCurrentTime();
    if (t !== null) setInTime(t);
  };

  const handleSetOut = () => {
    const t = getCurrentTime();
    if (t !== null) setOutTime(t);
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

  const handlePlayPiece = (piece: ClipEntity) => playRange(piece.start, piece.end);

  return (
    <div className="space-y-3">
      <PieceTimeline
        time={currentTime}
        duration={duration}
        inTime={inTime}
        outTime={outTime}
        pieces={pieces ?? []}
        onSelect={handlePlayPiece}
        onSeek={onSeek}
      />
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
  );
}

interface PieceCardListProps {
  resourceId: number;
  resourcePath: string;
  open: boolean;
  playRange: (start: number, end: number) => void;
}

export function PieceCardList({ resourceId, resourcePath, open, playRange }: PieceCardListProps) {
  const wasOpenRef = useRef(false);
  const [exportingId, setExportingId] = useState<number | null>(null);

  const { data: pieces } = clips.list.useQuery({ variables: resourceId, enabled: open });
  const { mutate: deleteClip } = clips.delete.useMutation({
    onSuccess: () => toast.success("Piece removed"),
    onError: () => toast.error("Failed to remove piece"),
  });
  const { mutate: createMaterial } = resources.create.useMutation({
    onSuccess: () => toast.success("Added to project"),
    onError: () => toast.error("Failed to add to project"),
  });

  // Reset export state only on a fresh open.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setExportingId(null);
    }
    wasOpenRef.current = open;
  }, [open]);

  const handlePlayPiece = (piece: ClipEntity) => playRange(piece.start, piece.end);

  // Cross-platform basename (Windows paths use "\"). Avoids node:path in the
  // renderer; the main process already resolves real paths via its own path.
  const basename = (p: string) => p.split(/[\\/]/).pop() ?? p;

  const exportFileName = (sourcePath: string, pieceName: string) => {
    const base = basename(sourcePath).replace(/\.\w+$/, "");
    const safe = pieceName.replace(/[\\/]/g, "-");
    return `${base}-${safe}.mp4`;
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
          sourceName: source.name,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Pieces</h3>
        <span className="text-xs text-muted-foreground">{pieces?.length ?? 0}</span>
      </div>
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto max-h-48 md:max-h-none">
        {pieces?.map((piece, i) => (
          <PieceCard
            key={piece.id}
            piece={piece}
            index={i}
            exportingId={exportingId}
            onPlay={handlePlayPiece}
            onExport={handleExport}
            onRemove={(id) => deleteClip({ id })}
          />
        ))}
        {(!pieces || pieces.length === 0) && (
          <p className="text-xs text-muted-foreground">No pieces yet.</p>
        )}
      </div>
    </>
  );
}
