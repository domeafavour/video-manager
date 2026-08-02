// Encode a filesystem path into a file:// URL. Normalizes Windows backslashes
// to `/` and ensures an absolute leading slash so `file://` + path yields
// `file:///Users/...` on macOS and `file:///C:/...` on Windows. Per-segment
// encoding keeps `#`, `?`, `%`, spaces and non-ASCII characters from being
// misread as URL delimiters (a `#` in the path would otherwise be treated as
// a fragment); a drive-letter colon is left unencoded (`C:` not `C%3A`).
export function toFileUrl(path: string) {
  const normalized = path.replace(/\\/g, "/");
  const urlPath = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return (
    "file://" +
    urlPath
      .split("/")
      .map((segment) => encodeURIComponent(segment).replace(/^([A-Za-z])%3A$/, "$1:"))
      .join("/")
  );
}
