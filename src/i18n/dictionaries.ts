import type { Locale } from "@/i18n/config"

// Teks antarmuka. Isi artikel datang dari API dan hanya tersedia dalam Bahasa Indonesia.
const id = {
  site: {
    title: "Dokumentasi Postmatic.id",
    description:
      "Panduan resmi Postmatic.id: cara mendaftar, menyiapkan workspace, menghubungkan sosial media, membuat konten otomatis dengan AI, harga token, dan tips terbaik.",
    keywords: [
      "Postmatic",
      "Postmatic.id",
      "dokumentasi Postmatic",
      "panduan Postmatic",
      "AI konten sosial media",
      "otomatisasi konten",
      "generate konten AI",
    ],
  },
  nav: {
    home: "Beranda",
    homeLabel: "Postmatic Docs, beranda",
    docsNavigation: "Navigasi dokumentasi",
    docsNavigationDescription: "Daftar kategori dan artikel dokumentasi Postmatic.",
    empty: "Dokumentasi belum tersedia.",
    search: "Cari dokumentasi",
    searchPlaceholder: "Cari dokumentasi...",
    start: "Mulai Sekarang",
    openMenu: "Buka menu navigasi",
    closeMenu: "Tutup menu navigasi",
    skipToContent: "Lewati ke konten",
    language: "Bahasa",
    switchLanguage: "Ganti bahasa",
  },
  theme: {
    toggle: "Ganti tema",
    light: "Terang",
    dark: "Gelap",
    system: "Sistem",
  },
  search: {
    title: "Cari dokumentasi",
    description: "Ketik kata kunci untuk mencari judul, sub-bagian, dan isi artikel dokumentasi.",
    heroPlaceholder: "Cari panduan, fitur, atau istilah…",
    loading: "Memuat indeks pencarian…",
    failed: "Indeks pencarian gagal dimuat. Periksa koneksi lalu coba lagi.",
    noResults: "Tidak ada hasil untuk “{query}”.",
    select: "pilih",
    open: "buka",
    close: "tutup",
  },
  toc: {
    title: "Pada halaman ini",
    overview: "Ikhtisar",
    backToTop: "Kembali ke atas",
    openLabel: ", daftar isi",
  },
  pager: {
    label: "Artikel sebelumnya dan selanjutnya",
    previous: "Sebelumnya",
    next: "Selanjutnya",
  },
  home: {
    badge: "Dokumentasi",
    description:
      "Semua yang perlu Anda ketahui untuk memakai Postmatic.id: dari membuat akun, menyiapkan workspace, sampai mengotomatiskan konten sosial media dengan AI.",
    startFrom: "Mulai dari: {title}",
    articleCount: "{count} artikel",
    empty: "Dokumentasi belum tersedia. Artikel yang dipublikasikan dari dashboard admin akan muncul di sini.",
  },
  category: {
    description: "{count} artikel panduan di kategori {name}.",
    metaDescription: "Kumpulan panduan {name} Postmatic.id: {titles}.",
  },
  article: {
    lastUpdated: "Terakhir diperbarui:",
    empty: "Konten artikel belum tersedia.",
    metaDescription: "Panduan {title} di dokumentasi Postmatic.id.",
    typeLabel: { information: "Article Docs", legality: "Legality" },
  },
  notFound: {
    title: "Halaman tidak ditemukan",
    breadcrumb: "Tidak ditemukan",
    description:
      "Artikel yang Anda cari mungkin sudah dipindahkan atau tidak lagi tersedia. Coba cari dengan kata kunci lain.",
    backHome: "Kembali ke beranda",
  },
  error: {
    title: "Dokumentasi tidak bisa dimuat",
    description: "Terjadi gangguan saat memuat halaman ini. Silakan coba lagi beberapa saat lagi.",
    retry: "Muat ulang",
    home: "Ke beranda",
  },
  footer: {
    tagline: "Made with love for your business.",
    linksLabel: "Tautan footer",
    website: "Website",
    help: "Bantuan",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  contact: {
    toc: "Hubungi kami",
    title: "Butuh bantuan lebih lanjut?",
    description: "Tim dukungan Postmatic siap membantu Anda.",
    button: "Hubungi kami",
    subject: "[Docs] Pertanyaan tentang dokumentasi Postmatic",
    bodyGreeting: "Halo tim Postmatic,",
    bodyPage: "Halaman",
  },
  language: {
    switchTo: "English",
  },
}

export type Dictionary = typeof id

const en: Dictionary = {
  site: {
    title: "Postmatic.id Documentation",
    description:
      "Official Postmatic.id guides: signing up, setting up your workspace, connecting social media, creating AI-powered content automatically, token pricing, and best practices.",
    keywords: [
      "Postmatic",
      "Postmatic.id",
      "Postmatic documentation",
      "Postmatic guide",
      "AI social media content",
      "content automation",
      "AI content generator",
    ],
  },
  nav: {
    home: "Home",
    homeLabel: "Postmatic Docs, home",
    docsNavigation: "Documentation navigation",
    docsNavigationDescription: "Postmatic documentation categories and articles.",
    empty: "No documentation available yet.",
    search: "Search documentation",
    searchPlaceholder: "Search documentation...",
    start: "Get Started",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    skipToContent: "Skip to content",
    language: "Language",
    switchLanguage: "Change language",
  },
  theme: {
    toggle: "Change theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  search: {
    title: "Search documentation",
    description: "Type a keyword to search article titles, sections, and content.",
    heroPlaceholder: "Search guides, features, or terms…",
    loading: "Loading search index…",
    failed: "The search index failed to load. Check your connection and try again.",
    noResults: "No results for “{query}”.",
    select: "select",
    open: "open",
    close: "close",
  },
  toc: {
    title: "On this page",
    overview: "Overview",
    backToTop: "Back to top",
    openLabel: ", table of contents",
  },
  pager: {
    label: "Previous and next articles",
    previous: "Previous",
    next: "Next",
  },
  home: {
    badge: "Documentation",
    description:
      "Everything you need to use Postmatic.id: from creating an account and setting up your workspace to automating social media content with AI.",
    startFrom: "Start with: {title}",
    articleCount: "{count} articles",
    empty: "No documentation yet. Articles published from the admin dashboard will appear here.",
  },
  category: {
    description: "{count} guides in the {name} category.",
    metaDescription: "Postmatic.id {name} guides: {titles}.",
  },
  article: {
    lastUpdated: "Last updated:",
    empty: "This article has no content yet.",
    metaDescription: "{title} guide in the Postmatic.id documentation.",
    typeLabel: { information: "Article Docs", legality: "Legality" },
  },
  notFound: {
    title: "Page not found",
    breadcrumb: "Not found",
    description: "The article you are looking for may have moved or is no longer available. Try searching with a different keyword.",
    backHome: "Back to home",
  },
  error: {
    title: "Documentation could not be loaded",
    description: "Something went wrong while loading this page. Please try again in a moment.",
    retry: "Reload",
    home: "Go home",
  },
  footer: {
    tagline: "Made with love for your business.",
    linksLabel: "Footer links",
    website: "Website",
    help: "Help",
    privacy: "Privacy",
    terms: "Terms",
  },
  contact: {
    toc: "Contact us",
    title: "Need more help?",
    description: "The Postmatic support team is ready to help you.",
    button: "Contact us",
    subject: "[Docs] Question about the Postmatic documentation",
    bodyGreeting: "Hi Postmatic team,",
    bodyPage: "Page",
  },
  language: {
    switchTo: "Bahasa Indonesia",
  },
}

const dictionaries: Record<Locale, Dictionary> = { id, en }

export function getDictionary(lang: Locale) {
  return dictionaries[lang]
}
