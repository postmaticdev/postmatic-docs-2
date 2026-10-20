import "server-only"

// Hanya deployment production yang boleh diindeks; preview/staging dan lokal
// diberi noindex agar tidak bersaing dengan situs utama di hasil pencarian.
export const ALLOW_INDEXING =
  process.env.ALLOW_INDEXING === "true" ||
  (process.env.ALLOW_INDEXING !== "false" && process.env.VERCEL_ENV === "production")
