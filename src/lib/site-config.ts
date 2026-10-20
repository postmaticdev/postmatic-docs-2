// Nilai publik yang dipakai server maupun client. Override lewat env saat build.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://docs.postmatic.id").replace(
  /\/+$/,
  "",
)

export const SITE_NAME = "Postmatic Docs"
export const SITE_TITLE = "Dokumentasi Postmatic.id"
export const SITE_DESCRIPTION =
  "Panduan resmi Postmatic.id: cara mendaftar, menyiapkan workspace, menghubungkan sosial media, membuat konten otomatis dengan AI, harga token, dan tips terbaik."

export const LANDING_URL = (
  process.env.NEXT_PUBLIC_LANDINGPAGE_URL?.trim() || "https://postmatic.id"
).replace(/\/+$/, "")

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim() || "https://workspace.postmatic.id"

// Sama dengan CTA di landing page: masuk lewat auth lalu diarahkan ke workspace.
export const START_URL =
  process.env.NEXT_PUBLIC_LOGIN_URL?.trim() ||
  `https://auth.postmatic.id/login?from=${encodeURIComponent(DASHBOARD_URL)}`

// Landing page mendukung /id dan /en untuk halaman legal.
export const privacyUrl = (lang: string) => `${LANDING_URL}/${lang}/privacy-policy`
export const termsUrl = (lang: string) => `${LANDING_URL}/${lang}/terms-of-service`

export const SUPPORT_EMAIL = "support@postmatic.id"
export const CONTACT_EMAIL = "team@postmatic.id"

export const BRAND_COLOR = "#0066FF"
