import { ClipEntity } from "@/typings";
import { formatTimestamp } from "@/utils/time-tag";

export type ClipExportFormat = "srt" | "txt";

const TIME_SEPARATOR: Record<ClipExportFormat, string> = {
  srt: ",",
  txt: ".",
};

/** Export order is chronological so the timeline reads top-to-bottom. */
export function sortPiecesByStart(pieces: ClipEntity[]): ClipEntity[] {
  return [...pieces].sort((a, b) => a.start - b.start);
}

/**
 * Build the export payload for a set of pieces.
 *
 * `srt` — numbered SubRip cues (blank-line separated), directly importable as
 * subtitles. `txt` — bare `range` + `name` pairs, no numbering.
 * The piece name doubles as the cue text.
 */
export function buildClipExport(
  pieces: ClipEntity[],
  format: ClipExportFormat,
): string {
  const sep = TIME_SEPARATOR[format];
  const sorted = sortPiecesByStart(pieces);

  if (format === "txt") {
    return sorted
      .map((p) => {
        const range = `${formatTimestamp(p.start, sep)} --> ${formatTimestamp(p.end, sep)}`;
        // Nameless pieces emit the range only — no trailing blank line.
        return p.name ? `${range}\n${p.name}` : range;
      })
      .join("\n");
  }

  return sorted
    .map((p, i) => {
      const range = `${formatTimestamp(p.start, sep)} --> ${formatTimestamp(p.end, sep)}`;
      return p.name ? `${i + 1}\n${range}\n${p.name}` : `${i + 1}\n${range}`;
    })
    .join("\n\n");
}

/** Strip characters that are illegal in filenames on Windows/macOS. */
export function clipExportFileName(
  resourcePath: string,
  format: ClipExportFormat,
): string {
  const base = (resourcePath.split(/[\\/]/).pop() ?? resourcePath).replace(
    /\.\w+$/,
    "",
  );
  return `${base.replace(/[:*?"<>|]/g, "-")}-pieces.${format}`;
}
