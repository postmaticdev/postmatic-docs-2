import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CodeBlockProps = {
  code: string
  language?: string
  filename?: string
  className?: string
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/50",
        className
      )}
    >
      <div className="flex items-center justify-between border-b bg-muted/80 px-4 py-2">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="font-mono text-xs text-muted-foreground">
              {filename}
            </span>
          )}
          <Badge variant="secondary" className="text-[10px] uppercase">
            {language}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="opacity-100 transition-opacity group-hover:opacity-100"
        >
          {copied ? (
            <Check className="text-emerald-500" />
          ) : (
            <Copy className="text-muted-foreground" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-relaxed text-foreground">
          {code}
        </code>
      </pre>
    </div>
  )
}
