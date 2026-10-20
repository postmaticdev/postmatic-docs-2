import { notFound } from "next/navigation"

// Path yang lebih dalam dari /kategori/artikel tidak ada; tampilkan halaman 404
// di dalam layout dokumentasi (bukan 404 bawaan Next tanpa navigasi).
export default function CatchAll() {
  notFound()
}
