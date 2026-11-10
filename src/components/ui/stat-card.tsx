import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number
  hint: string
  icon: LucideIcon
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground/70" aria-hidden="true" />
        </div>
        <p className="mt-4 font-mono text-5xl leading-none font-medium tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
