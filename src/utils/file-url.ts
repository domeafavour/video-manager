// Encode a filesystem path into a file:// URL. Per-segment encoding so that
// `#`, `?`, `%`, spaces and non-ASCII characters in a filename don't get
// misread as URL delimiters (a `#` in the path would otherwise be treated as
// a fragment and the file would resolve to the wrong path).
export function toFileUrl(path: string) {
  return "file://" + path.split("/").map(encodeURIComponent).join("/");
}
