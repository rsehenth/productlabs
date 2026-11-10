import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '@/components/layout/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import { routeFromHash, routeHref } from '@/lib/routing'
import { isUsableBox, placePanel, type Box } from '@/features/product-tour/tour-layout'
import {
  clampStep,
  nextBlockStart,
  progressLabel,
  TOUR_STEPS,
} from '@/features/product-tour/tour-steps'

interface ProductTourProps {
  onClose: () => void
  /** Botão "Como funciona": recebe o foco de volta ao encerrar. */
  returnFocusRef: RefObject<HTMLElement | null>
}

const TARGET_WAIT_MS = 3000

/** Heurística: formulário ou campo de texto longo na página indica trabalho que a troca de rota descartaria. */
function hasPossibleUnsavedWork(): boolean {
  return document.querySelector('main form, main textarea') !== null
}

function toBox(rect: DOMRect): Box {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

export function ProductTour({ onClose, returnFocusRef }: ProductTourProps) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState<'confirm' | 'tour'>(() =>
    hasPossibleUnsavedWork() ? 'confirm' : 'tour',
  )
  const [index, setIndex] = useState(0)
  const [found, setFound] = useState<{ stepId: string; box: Box } | null>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const startHash = useRef(window.location.hash)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()

  const step = TOUR_STEPS[clampStep(index)]!
  const isLast = index >= TOUR_STEPS.length - 1
  const skipTo = nextBlockStart(index)
  const targetBox = found && found.stepId === step.id ? found.box : null
  const ModuleIcon = NAV_ITEMS[step.route].icon

  const close = useCallback(() => {
    // Restaura a página de origem; `replace` evita encher o histórico com as páginas do tour.
    if (window.location.hash !== startHash.current) {
      window.location.replace(startHash.current || routeHref('overview'))
    }
    onClose()
  }, [onClose])

  // Modal: o resto da aplicação fica inerte (sem foco nem cliques) enquanto o tour está aberto.
  useEffect(() => {
    const root = document.getElementById('root')
    const trigger = returnFocusRef.current
    if (root) root.inert = true
    return () => {
      if (root) root.inert = false
      trigger?.focus()
    }
  }, [returnFocusRef])

  // Escape encerra; Tab circula apenas entre os botões do painel.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const buttons = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (!first || !last) return
      const active = document.activeElement
      if (!panelRef.current.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (active === first || active === titleRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close])

  // Foco inicial no título (lido com o nome e a descrição do diálogo).
  useEffect(() => {
    titleRef.current?.focus()
  }, [phase])

  // Se o botão focado ficou desabilitado ou saiu do painel, o foco vai para a ação principal.
  useEffect(() => {
    const active = document.activeElement
    if (!panelRef.current?.contains(active) || (active instanceof HTMLButtonElement && active.disabled)) {
      primaryRef.current?.focus()
    }
  }, [index])

  // Navega para a rota da etapa com o roteador de hash existente.
  useEffect(() => {
    if (phase === 'tour' && routeFromHash(window.location.hash) !== step.route) {
      window.location.replace(routeHref(step.route))
    }
  }, [phase, step])

  // Procura o alvo (a página pode estar carregando) por tempo limitado, rola até ele e o acompanha.
  useEffect(() => {
    if (phase !== 'tour' || !step.targetId) return
    const selector = `[data-tour-id="${step.targetId}"]`
    let element: HTMLElement | null = null
    let frame = 0
    let observer: MutationObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let timer = 0

    const measure = () => {
      frame = 0
      if (element) setFound({ stepId: step.id, box: toBox(element.getBoundingClientRect()) })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const stopWaiting = () => {
      observer?.disconnect()
      window.clearTimeout(timer)
    }
    const tryAttach = () => {
      const candidate = document.querySelector<HTMLElement>(selector)
      if (!candidate || !isUsableBox(toBox(candidate.getBoundingClientRect()))) return
      stopWaiting()
      element = candidate
      candidate.scrollIntoView({ block: 'start', inline: 'nearest' })
      window.addEventListener('scroll', schedule, true)
      window.addEventListener('resize', schedule)
      resizeObserver = new ResizeObserver(schedule)
      resizeObserver.observe(candidate)
      measure()
    }

    tryAttach()
    if (!element) {
      observer = new MutationObserver(tryAttach)
      observer.observe(document.body, { childList: true, subtree: true })
      timer = window.setTimeout(stopWaiting, TARGET_WAIT_MS)
    }

    return () => {
      stopWaiting()
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
    }
  }, [phase, step])

  // Posiciona o painel dentro da viewport, longe do alvo.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const place = () => {
      const rect = panel.getBoundingClientRect()
      const next = placePanel(
        targetBox,
        { width: rect.width, height: rect.height },
        { width: window.innerWidth, height: window.innerHeight },
      )
      setPosition((previous) =>
        previous && previous.top === next.top && previous.left === next.left ? previous : next,
      )
    }
    place()
    const resizeObserver = new ResizeObserver(place)
    resizeObserver.observe(panel)
    window.addEventListener('resize', place)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [targetBox, index, phase])

  const title = phase === 'confirm' ? t('Iniciar o tour?') : t(step.title)

  return createPortal(
    <>
      {targetBox ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[55] rounded-lg outline-2 outline-offset-4 outline-primary"
          style={{
            top: targetBox.top,
            left: targetBox.left,
            width: targetBox.width,
            height: targetBox.height,
          }}
        />
      ) : null}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        style={position ? { top: position.top, left: position.left } : { bottom: 16, right: 16 }}
        className="fixed z-[60] flex max-h-[calc(100svh-2rem)] w-[min(26rem,calc(100vw-2rem))] flex-col gap-4 overflow-y-auto rounded-xl border border-field bg-popover p-5 text-popover-foreground"
      >
        {phase === 'tour' ? (
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-muted-foreground">{progressLabel(index)}</p>
            <div aria-hidden="true" className="h-0.5 flex-1 bg-border">
              <div
                className="h-full bg-primary"
                style={{ width: `${((index + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <h2
            id={titleId}
            ref={titleRef}
            tabIndex={-1}
            className="font-display text-xl leading-snug font-semibold text-foreground outline-none"
          >
            {title}
          </h2>
          {phase === 'tour' ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ModuleIcon className="size-3.5 text-primary" aria-hidden="true" />
              <span>{step.module}</span>
            </p>
          ) : null}
        </div>

        <div id={bodyId} className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {phase === 'confirm' ? (
            <p>
              {t(
                'O tour troca de página e pode descartar o que ainda não foi salvo aqui, como um formulário em edição ou o progresso do Interactive Case. Ele não cria, altera nem exclui registros.',
              )}
            </p>
          ) : (
            <>
              <p>{t(step.body[0] ?? '')}</p>
              {step.items ? (
                <ul className="list-disc space-y-0.5 pl-5 marker:text-primary">
                  {step.items.map((item) => (
                    <li key={item}>{t(item)}</li>
                  ))}
                </ul>
              ) : null}
              {step.body.slice(1).map((paragraph) => (
                <p key={paragraph}>{t(paragraph)}</p>
              ))}
            </>
          )}
        </div>

        {phase === 'confirm' ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={close}>
              {t('Cancelar')}
            </Button>
            <Button ref={primaryRef} onClick={() => setPhase('tour')}>
              {t('Iniciar tour')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={index === 0}
                onClick={() => setIndex((current) => clampStep(current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
                {t('Anterior')}
              </Button>
              {isLast ? (
                <Button ref={primaryRef} onClick={close}>
                  <Check aria-hidden="true" />
                  {t('Concluir')}
                </Button>
              ) : (
                <Button ref={primaryRef} onClick={() => setIndex((current) => clampStep(current + 1))}>
                  {t('Próximo')}
                  <ChevronRight aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {skipTo !== null ? (
                <Button variant="ghost" size="sm" onClick={() => setIndex(skipTo)}>
                  {t('Pular bloco')}
                </Button>
              ) : (
                <span />
              )}
              <Button variant="ghost" size="sm" onClick={close}>
                {t('Sair do tour')}
              </Button>
            </div>
            {index > 0 ? (
              <p role="status" className="sr-only">
                {t('Etapa {progress}: {title}', { progress: progressLabel(index), title: t(step.title) })}
              </p>
            ) : null}
          </>
        )}
      </div>
    </>,
    document.body,
  )
}
