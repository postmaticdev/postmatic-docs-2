import { Info, Lightbulb, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CodeBlock } from "@/components/docs/code-block"

const installCode = `npm install postmatic
# atau
yarn add postmatic
# atau
pnpm add postmatic`

const initCode = `import { Postmatic } from 'postmatic'

const client = new Postmatic({
  apiKey: process.env.POSTMATIC_API_KEY,
  region: 'id-jkt-1',
})`

const sendEmailCode = `async function sendWelcomeEmail(userEmail: string) {
  const response = await client.emails.send({
    to: userEmail,
    template: 'welcome-id',
    variables: {
      name: 'Pengguna',
      loginUrl: 'https://app.postmatic.id/login',
    },
  })

  console.log('Email terkirim:', response.id)
  return response
}`

const webhookCode = `{
  "event": "email.sent",
  "data": {
    "id": "msg_8x2k4j9",
    "to": "user@example.id",
    "status": "delivered",
    "timestamp": "2026-07-11T08:30:00Z"
  }
}`

const configTable = [
  { param: "apiKey", type: "string", required: "Ya", desc: "Kunci API dari dashboard Postmatic" },
  { param: "region", type: "string", required: "Tidak", desc: "Region server, default: id-jkt-1" },
  { param: "timeout", type: "number", required: "Tidak", desc: "Timeout request dalam ms, default: 30000" },
  { param: "retry", type: "boolean", required: "Tidak", desc: "Aktifkan retry otomatis, default: true" },
]

export function MainContent() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Dokumentasi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mulai Cepat</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">Panduan</Badge>
        <Badge variant="outline">v2.0</Badge>
      </div>

      <h1
        id="mulai-cepat"
        className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance"
      >
        Mulai Cepat dengan Postmatic.id
      </h1>

      <p className="text-xl text-muted-foreground mt-4 leading-relaxed">
        Panduan singkat untuk mengintegrasikan Postmatic.id ke dalam aplikasi
        Anda dalam waktu kurang dari 5 menit.
      </p>

      <div className="mt-8 flex items-center gap-3 border-y py-4 text-sm text-muted-foreground">
        <span>Terakhir diperbarui: 11 Juli 2026</span>
      </div>

      <h2
        id="apa-itu-postmatic"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Apa itu Postmatic.id?
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Postmatic.id adalah platform otomatisasi email dan notifikasi yang
        dirancang khusus untuk pengembang Indonesia. Dengan API yang sederhana
        dan dokumentasi yang lengkap, Anda dapat mengirim email transaksional,
        kampanye pemasaran, dan notifikasi push hanya dengan beberapa baris kode.
      </p>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Platform ini mendukung berbagai fitur seperti template dinamis,
        penjadwalan, segmentasi audiens, analitik real-time, dan webhooks untuk
        integrasi sistem yang lebih dalam.
      </p>

      <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex gap-3">
          <Info className="size-5 shrink-0 text-blue-500" />
          <div>
            <p className="font-medium text-sm">Info</p>
            <p className="text-sm text-muted-foreground mt-1">
              Postmatic.id tersedia dalam paket gratis hingga 1.000 email per
              bulan. Untuk volume lebih besar, lihat halaman harga.
            </p>
          </div>
        </div>
      </div>

      <h2
        id="prasyarat"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Prasyarat
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Sebelum memulai, pastikan Anda telah menyiapkan hal-hal berikut:
      </p>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 leading-7">
        <li>Node.js versi 18 atau lebih baru terpasang di sistem Anda</li>
        <li>Akun Postmatic.id yang aktif (daftar gratis di postmatic.id/register)</li>
        <li>API Key yang dapat diperoleh dari halaman Dashboard &rarr; Settings &rarr; API Keys</li>
        <li>Domain email yang sudah terverifikasi (DKIM & SPF)</li>
      </ul>

      <h2
        id="instalasi"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Instalasi
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Pasang paket <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">postmatic</code> menggunakan
        package manager pilihan Anda:
      </p>

      <div className="mt-6">
        <CodeBlock code={installCode} language="bash" filename="terminal" />
      </div>

      <h3
        id="inisialisasi-client"
        className="scroll-m-20 mt-8 text-2xl font-semibold tracking-tight"
      >
        Inisialisasi Client
      </h3>

      <p className="leading-7 mt-4 [&:not(:first-child)]:mt-4">
        Setelah paket terpasang, inisialisasi client Postmatic dengan API Key
        Anda. Simpan API Key di environment variable untuk keamanan:
      </p>

      <div className="mt-4">
        <CodeBlock code={initCode} language="typescript" filename="client.ts" />
      </div>

      <h3
        id="konfigurasi"
        className="scroll-m-20 mt-8 text-2xl font-semibold tracking-tight"
      >
        Opsi Konfigurasi
      </h3>

      <p className="leading-7 mt-4 [&:not(:first-child)]:mt-4">
        Berikut adalah opsi konfigurasi yang tersedia saat inisialisasi client:
      </p>

      <div className="mt-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold">Parameter</th>
              <th className="border px-4 py-2 text-left font-bold">Tipe</th>
              <th className="border px-4 py-2 text-left font-bold">Wajib</th>
              <th className="border px-4 py-2 text-left font-bold">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {configTable.map((row) => (
              <tr key={row.param} className="m-0 border-t p-0 even:bg-muted">
                <td className="border px-4 py-2 text-left font-mono text-sm">
                  {row.param}
                </td>
                <td className="border px-4 py-2 text-left font-mono text-sm text-muted-foreground">
                  {row.type}
                </td>
                <td className="border px-4 py-2 text-left">
                  {row.required === "Ya" ? (
                    <span className="text-red-500">{row.required}</span>
                  ) : (
                    <span className="text-muted-foreground">{row.required}</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-left text-sm text-muted-foreground">
                  {row.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        id="mengirim-email"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Mengirim Email Pertama
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Setelah client terinisialisasi, Anda dapat mulai mengirim email. Berikut
        contoh mengirim email selamat datang menggunakan template:
      </p>

      <div className="mt-6">
        <CodeBlock code={sendEmailCode} language="typescript" filename="welcome.ts" />
      </div>

      <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex gap-3">
          <Lightbulb className="size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-medium text-sm">Tips</p>
            <p className="text-sm text-muted-foreground mt-1">
              Gunakan template yang sudah dibuat di dashboard untuk memisahkan
              desain email dari logika aplikasi Anda.
            </p>
          </div>
        </div>
      </div>

      <h2
        id="webhooks"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Webhooks
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Postmatic.id dapat mengirim webhook ke endpoint Anda ketika suatu event
        terjadi, misalnya saat email berhasil terkirim atau saat ada bounce.
        Berikut contoh payload yang akan diterima endpoint Anda:
      </p>

      <div className="mt-6">
        <CodeBlock code={webhookCode} language="json" filename="webhook-payload.json" />
      </div>

      <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex gap-3">
          <TriangleAlert className="size-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-sm">Peringatan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Selalu validasi signature webhook menggunakan secret key Anda
              untuk memastikan payload benar-benar berasal dari Postmatic.id.
            </p>
          </div>
        </div>
      </div>

      <h2
        id="langkah-selanjutnya"
        className="scroll-m-20 mt-10 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      >
        Langkah Selanjutnya
      </h2>

      <p className="leading-7 mt-6 [&:not(:first-child)]:mt-6">
        Setelah berhasil mengirim email pertama, Anda dapat menjelajahi fitur
        lanjutan seperti:
      </p>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 leading-7">
        <li>Template dinamis dengan variabel dan kondisional</li>
        <li>Penjadwalan kampanye email massal</li>
        <li>Segmentasi audiens berdasarkan perilaku</li>
        <li>Integrasi webhook untuk notifikasi real-time</li>
        <li>Analitik dan pelaporan terperinci</li>
      </ul>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 border-t pt-8">
        <a
          href="#sebelumnya"
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-3 sm:p-5 transition-all duration-200 hover:bg-accent/50 hover:border-foreground/10 text-left"
        >
          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            ← Sebelumnya
          </span>
          <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            Apa itu Postmatic?
          </span>
        </a>

        <a
          href="#selanjutnya"
          className="group flex flex-col gap-1 rounded-xl border border-transparent bg-[#0066FF] p-3 sm:p-5 transition-all duration-200 hover:bg-[#0052cc] text-right items-end shadow-xs"
        >
          <span className="text-[10px] sm:text-xs text-blue-100 flex items-center justify-end gap-1">
            Selanjutnya →
          </span>
          <span className="text-sm sm:text-base font-semibold text-white transition-colors line-clamp-2">
            Perbandingan
          </span>
        </a>
      </div>
    </article>
  )
}
