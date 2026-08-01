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

interface Props {
  resourceId: number;
  resourcePath: string;
  open: boolean;
  currentTime: number;
  duration: number;
  getCurrentTime: () => number | null;
  playRange: (start: number, end: number) => void;
}

function PieceTimeline({
  time,
  duration,
  inTime,
  outTime,
  pieces,
  onSelect,
}: {
  time: number;
  duration: number;
  inTime: number | null;
  outTime: number | null;
  pieces: ClipEntity[];
  onSelect: (piece: ClipEntity) => void;
}) {
  if (duration <= 0) return null;
  return (
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
        style={{ left: `${pct(time, duration)}%` }}
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

export function PiecesPanel({
  resourceId,
  resourcePath,
  open,
  currentTime,
  duration,
  getCurrentTime,
  playRange,
}: Props) {
  const wasOpenRef = useRef(false);
  const [inTime, setInTime] = useState<number | null>(null);
  const [outTime, setOutTime] = useState<number | null>(null);
  const [clipName, setClipName] = useState("");
  const [exportingId, setExportingId] = useState<number | null>(null);

  const { data: pieces } = clips.list.useQuery({ variables: resourceId, enabled: open });
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

  // Reset piece-marking state only on a fresh open.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setInTime(null);
      setOutTime(null);
      setClipName("");
      setExportingId(null);
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
    <div className="flex flex-col md:flex-row gap-4 pt-3 border-t">
      <div className="flex-1 space-y-3 min-w-0">
        <PieceTimeline
          time={currentTime}
          duration={duration}
          inTime={inTime}
          outTime={outTime}
          pieces={pieces ?? []}
          onSelect={handlePlayPiece}
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

      <div className="md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Pieces</h3>
          <span className="text-xs text-muted-foreground">{pieces?.length ?? 0}</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
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
      </div>
    </div>
  );
}
