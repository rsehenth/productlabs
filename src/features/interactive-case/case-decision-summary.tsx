import type { ReactNode } from 'react'
import { CaseKindTag } from '@/features/interactive-case/case-kind-tag'
import { Card, CardContent } from '@/components/ui/card'
import { Notice } from '@/components/ui/notice'
import type { CaseDecisionSummaryContent } from '@/features/interactive-case/case-decision-view'

interface CaseDecisionSummaryProps {
  summary: CaseDecisionSummaryContent | null
  missingMessages: readonly string[]
}

const PM_NOTE =
  'Uma decisão de produto envolve benefícios, riscos, restrições e evidências incompletas. Escolher uma direção não significa comprovar sua efetividade.'

const NEXT_STEP =
  'A próxima etapa de uma investigação real seria validar a hipótese, definir critérios de sucesso e acompanhar os resultados após uma intervenção.'

const EDITORIAL_NOTE =
  'Esta é uma síntese do seu raciocínio dentro do cenário demonstrativo. Ela não representa uma decisão implementada no ProfResolve nem comprova a efetividade de qualquer intervenção.'

function SummaryBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function CaseDecisionSummary({ summary, missingMessages }: CaseDecisionSummaryProps) {
  if (summary === null) {
    if (missingMessages.length === 0) return null
    return (
      <section aria-labelledby="case-decision-summary-title" className="space-y-3">
        <h2 id="case-decision-summary-title" className="text-lg font-semibold text-foreground">
          Sua decisão de produto
        </h2>
        <Notice tone="error">
          <p className="font-medium">Ainda faltam requisitos para visualizar a síntese.</p>
          <ul className="list-disc space-y-1 pl-4">
            {missingMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p>Seus dados preenchidos foram mantidos.</p>
        </Notice>
      </section>
    )
  }

  return (
    <section aria-labelledby="case-decision-summary-title" className="space-y-3">
      <div className="space-y-1">
        <CaseKindTag kind="choice" note="dentro do cenário demonstrativo" />
        <h2 id="case-decision-summary-title" className="text-lg font-semibold text-foreground">
          Sua decisão de produto
        </h2>
      </div>

      <Notice tone="info">{EDITORIAL_NOTE}</Notice>

      <Card>
        <CardContent className="space-y-6 p-5">
          <SummaryBlock title="Problema investigado">
            <p className="text-sm leading-relaxed text-foreground">{summary.problem}</p>
          </SummaryBlock>

          <SummaryBlock title="Indicador em análise">
            <p className="text-sm leading-relaxed text-foreground">
              {summary.metricName ?? 'Nenhum indicador selecionado.'}
            </p>
          </SummaryBlock>

          <SummaryBlock title="Evidências escolhidas (relatos fictícios)">
            <ul className="space-y-2">
              {summary.evidence.map((view) => (
                <li
                  key={view.id}
                  className="rounded-lg border border-l-2 border-border/70 border-l-chart-2/60 bg-background/40 p-3 text-sm leading-relaxed text-foreground"
                >
                  {view.content}
                </li>
              ))}
            </ul>
          </SummaryBlock>

          <SummaryBlock title="Sua hipótese (não verificada)">
            <p className="whitespace-pre-line border-l-2 border-chart-3/60 pl-3 text-sm leading-relaxed text-foreground">
              {summary.hypothesis}
            </p>
          </SummaryBlock>

          <SummaryBlock title="Direção escolhida">
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {summary.option.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {summary.option.description}
            </p>
          </SummaryBlock>

          <SummaryBlock title="Benefícios potenciais">
            <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground">
              {summary.option.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </SummaryBlock>

          <SummaryBlock title="Riscos e limitações">
            <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground">
              {summary.option.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </SummaryBlock>

          <SummaryBlock title="Informações que ainda seriam necessárias">
            <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-foreground">
              {summary.option.additionalInformation.map((information) => (
                <li key={information}>{information}</li>
              ))}
            </ul>
          </SummaryBlock>

          <Notice tone="info">{PM_NOTE}</Notice>

          <SummaryBlock title="Próximo raciocínio">
            <p className="text-sm leading-relaxed text-foreground">{NEXT_STEP}</p>
          </SummaryBlock>
        </CardContent>
      </Card>
    </section>
  )
}
