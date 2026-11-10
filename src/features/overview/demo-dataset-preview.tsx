import { Quote } from 'lucide-react'
import {
  DEMO_DATASET_NOTICE,
  DEMO_DECISIONS,
  DEMO_FEEDBACKS,
  DEMO_PRODUCT_NAME,
} from '@/data/demo/demo-dataset'
import { DemoActivationChart } from '@/features/overview/demo-activation-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DECISION_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_SOURCE_LABELS,
} from '@/lib/domain-labels'

const QUOTE_ID = 'demo-feedback-import-manual'
const DECISION_ID = 'demo-decision-onboarding-templates'

export function DemoDatasetPreview() {
  const quote = DEMO_FEEDBACKS.find((feedback) => feedback.id === QUOTE_ID)
  const decision = DEMO_DECISIONS.find((record) => record.id === DECISION_ID)

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base font-semibold">Dataset demonstrativo</CardTitle>
          <Badge variant="simulated">Simulado</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{DEMO_DATASET_NOTICE}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground/80">
          Produto fictício: {DEMO_PRODUCT_NAME}
        </p>

        <DemoActivationChart />

        {quote ? (
          <figure className="rounded-lg border-l-2 border-primary/50 bg-accent/30 px-4 py-3">
            <Quote className="size-3.5 text-primary" aria-hidden="true" />
            <blockquote className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {quote.content}
            </blockquote>
            <figcaption className="mt-2 text-[11px] text-muted-foreground/80">
              {FEEDBACK_CATEGORY_LABELS[quote.category]} ·{' '}
              {FEEDBACK_SOURCE_LABELS[quote.source]} · feedback simulado
            </figcaption>
          </figure>
        ) : null}

        {decision ? (
          <div className="rounded-lg border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{decision.title}</p>
              <Badge variant="outline">{DECISION_STATUS_LABELS[decision.status]}</Badge>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {decision.problem}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              {decision.metricIds.length} métricas e {decision.feedbackIds.length} feedbacks
              relacionados
            </p>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Este dataset não é gravado no workspace: os dados locais começam vazios e permanecem
        separados.
      </CardFooter>
    </Card>
  )
}
