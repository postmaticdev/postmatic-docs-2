import * as React from "react"
import {
  BookOpen,
  ChevronRight,
  Code2,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Mail,
  Plug,
  Rocket,
  Settings,
  Terminal,
  Webhook,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Memulai",
    items: [
      { title: "Pengenalan", href: "#pengenalan", icon: BookOpen },
      { title: "Instalasi", href: "#instalasi", icon: Rocket, badge: "Baru" },
      { title: "Mulai Cepat", href: "#mulai-cepat", icon: Terminal },
    ],
  },
  {
    title: "Fitur Utama",
    items: [
      { title: "Email Automation", href: "#email-automation", icon: Mail },
      { title: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
      { title: "Pengaturan", href: "#pengaturan", icon: Settings },
    ],
  },
  {
    title: "Integrasi",
    items: [
      { title: "API Keys", href: "#api-keys", icon: KeyRound },
      { title: "Webhooks", href: "#webhooks", icon: Webhook },
      { title: "Plugin & Ekstensi", href: "#plugin-ekstensi", icon: Plug },
    ],
  },
  {
    title: "Referensi API",
    items: [
      { title: "Endpoint", href: "#endpoint", icon: Code2 },
      { title: "Autentikasi", href: "#autentikasi", icon: KeyRound },
      { title: "Rate Limits", href: "#rate-limits", icon: Webhook },
    ],
  },
  {
    title: "Bantuan",
    items: [
      { title: "FAQ", href: "#faq", icon: HelpCircle },
      { title: "Troubleshooting", href: "#troubleshooting", icon: HelpCircle },
    ],
  },
]

type LeftSidebarProps = {
  className?: string
  activeHref?: string
  onLinkClick?: () => void
}

export function LeftSidebar({ className, activeHref = "#mulai-cepat", onLinkClick }: LeftSidebarProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(navSections.map((s) => [s.title, s.title === "Memulai"]))
  )

  const toggleSection = (title: string) =>
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))

  return (
    <nav className={cn("flex flex-col gap-6 p-4", className)}>
      {navSections.map((section) => {
        const isOpen = openSections[section.title]
        return (
          <Collapsible
            key={section.title}
            open={isOpen}
            onOpenChange={() => toggleSection(section.title)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              {section.title}
              <ChevronRight
                className={cn(
                  "size-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 flex flex-col gap-0.5 border-l pl-3">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === activeHref
                  return (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-md py-1.5 pr-2 pl-2 text-sm transition-colors",
                          isActive
                            ? "font-semibold text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground/70 group-hover:text-foreground"
                            )}
                          />
                        )}
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </nav>
  )
}
