"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { useRouter } from "next/navigation"

import Splash from "./Splash"
import Progress from "./Progress"
import ChatHeader from "./ChatHeader"
import AssistantMessage from "./AssistantMessage"
import UserMessage from "./UserMessage"
import AnswerComposer from "./AnswerComposer"
import AssistantAvatar from "./AssistantAvatar"
import TypingIndicator from "./TypingIndicator"
import { IntroWaveBackground } from "./IntroWaveBackground"

import {
  useWizard
} from "../hooks/useWizard"

import { mapWizardAnswersToFilters } from "../lib/answers-to-filters"
import { formatAnswerAsMessage } from "../lib/answer-to-message"
import { useDiscover, type Locale } from "@/lib/discover/filters-context"
import { buildDeck } from "@/lib/discover/deck"
import { useTranslation, type TranslationKey } from "@/lib/i18n/useTranslation"
import { localizeConfig } from "@/lib/i18n/wizard-content"
import MatchPreviewCard from "./MatchPreviewCard"

import type {
  WizardConfig,
  QuestionStep,
  WizardAnswer
} from "../types"
import type { Listing } from "@/lib/discover/types"

type T = (key: TranslationKey, vars?: Record<string, string | number>) => string

function propertyTypePlural(type: string, t: T): string {
  switch (type) {
    case "apartment": return t("wizard.apartmentsPlural")
    case "house": return t("wizard.housesPlural")
    case "ph": return t("wizard.phsPlural")
    case "loft": return t("wizard.loftsPlural")
    default: return t("wizard.propertyTypesPlural")
  }
}

/** Joins picked neighborhoods with a locale-correct "and"/"y", e.g. "Pocitos y Cordón" or "Pocitos, Cordón y más". */
function joinHoods(hoods: string[], t: T): string {
  if (hoods.length === 0) return t("wizard.anywhere")
  if (hoods.length === 1) return hoods[0]
  if (hoods.length === 2) return `${hoods[0]} ${t("wizard.and")} ${hoods[1]}`
  return `${hoods.slice(0, 2).join(", ")} ${t("wizard.andMore")}`
}

/** Turns the visitor's actual picks into "Juan, buscando apartamentos en Pocitos y Cordón..." instead of a generic corporate placeholder. */
function buildProcessingMessage(answers: Record<string, WizardAnswer>, name: string, t: T): string {
  const hoods = Array.isArray(answers.preferred_locations?.value) ? answers.preferred_locations.value : []
  const types = Array.isArray(answers.property_type?.value) ? answers.property_type.value : []

  const typeLabel = types.length === 1 ? propertyTypePlural(types[0], t) : t("wizard.propertyTypesPlural")
  const hoodsLabel = joinHoods(hoods, t)

  const lead = name ? t("wizard.processingLead", { name }) : t("wizard.processingLeadGeneric")
  return `${lead} ${typeLabel} ${t("wizard.inLocation")} ${hoodsLabel}...`
}

function capitalize(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed
}

/**
 * Replaces a literal "{{NAME}}" token in any config string (intro copy,
 * question titles, etc.) with the visitor's name. When the name isn't known
 * yet, the token — and any leading space before it — is dropped instead of
 * leaving a stray blank ("Excelente {{NAME}}!" -> "Excelente!" rather than
 * "Excelente  !"), so the same string reads fine either way.
 */
function interpolateName(text: string, name: string): string {
  return name ? text.replace(/\{\{NAME\}\}/g, name) : text.replace(/\s*\{\{NAME\}\}/g, "")
}

/**
 * Personalizes a handful of moments once we know the visitor's name — a few
 * spots per flow (not literally every question, which would read like a
 * mail-merge instead of a real touch), including one contextual callback to
 * an earlier answer so it feels like Wee is actually tracking the
 * conversation rather than reciting a fixed script. Falls back to
 * interpolateName so a plain "{{NAME}}" token dropped into a question's own
 * title/subtitle in the config also works, without needing a case here.
 */
function personalizeTitle(
  question: QuestionStep,
  name: string,
  answers: Record<string, WizardAnswer>,
  isSellerFlow: boolean,
  locale: Locale
): string {
  if (!name) return interpolateName(question.title ?? "", name)

  if (isSellerFlow) {
    switch (question.id) {
      case "property_type":
        return locale === "en"
          ? `Tell me, ${name} — what type of property do you want to sell?`
          : `Contame, ${name} — ¿qué tipo de propiedad querés vender?`
      case "contact_method":
        return locale === "en"
          ? `Last question, ${name} — how would you prefer we contact you?`
          : `Última pregunta, ${name} — ¿cómo preferís que te contactemos?`
      default:
        return interpolateName(question.title ?? "", name)
    }
  }

  switch (question.id) {
    case "intent":
      return locale === "en"
        ? `Great, ${name} — let's start with what you're looking for`
        : `Muy bien ${name}, comencemos por saber qué estás buscando`

    case "preferred_locations":
      return locale === "en" ? `Tell me, ${name} — which areas interest you?` : `Decime, ${name} — ¿qué zonas te interesan?`

    case "parking": {
      const hoods = Array.isArray(answers.preferred_locations?.value) ? answers.preferred_locations.value : []
      if (locale === "en") {
        const hoodsHint = hoods.length === 1 ? ` for ${hoods[0]}` : ""
        return `Almost done, ${name} — do you need parking${hoodsHint}?`
      }
      const hoodsHint = hoods.length === 1 ? ` para ${hoods[0]}` : ""
      return `Ya casi terminamos, ${name} — ¿necesitás cochera o garaje${hoodsHint}?`
    }

    default:
      return interpolateName(question.title ?? "", name)
  }
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar size={36} state="thinking" />
      <div>
        <span className="mb-1 block pl-1 text-[10.5px] font-bold text-muted-foreground">Wee</span>
        <TypingIndicator />
      </div>
    </div>
  )
}

interface WizardCompletionOverride {
  heading?: string
  body?: string
  ctaLabel: string
  onCta: () => void
  showRestart?: boolean
}

interface WizardProps {

  config: WizardConfig

  /** Replaces the default "apply as Discover filters" behavior on finish (e.g. the seller flow submits a lead instead). */
  onFinish?: (summary: Record<string, WizardAnswer>) => void | Promise<void>

  /** Replaces the default "Buscando apartamentos en..." processing copy. */
  processingMessage?: (answers: Record<string, WizardAnswer>, name: string) => string

  /** Replaces the default "Ver mi selección" completion screen. */
  completion?: WizardCompletionOverride

  /**
   * Whether the welcome screen asks for the visitor's name and offers a
   * "skip to profile" link. Defaults to true (the buyer flow). Flows that
   * already ask for a full name later as a regular question (like the
   * seller flow) should set this to false to avoid asking twice.
   */
  collectNameOnIntro?: boolean

  /** Overrides the "Tu búsqueda" progress-bar label. */
  progressLabel?: string

  /**
   * The published catalog, used to preview the #1 curated match right on
   * the completion screen (see MatchPreviewCard) — omitted entirely by
   * flows with nothing to match against (e.g. the seller flow), which just
   * never renders a preview.
   */
  listings?: Listing[]

}

type MessagePhase = "typing" | "message" | "action"

/** References the neighborhoods they actually picked, when there are any, instead of a flat generic sentence every time. */
function buildCompletionBody(answers: Record<string, WizardAnswer>, t: T): string {
  const hoods = Array.isArray(answers.preferred_locations?.value) ? answers.preferred_locations.value : []
  const hoodsClause =
    hoods.length === 0
      ? ""
      : hoods.length === 1
        ? ` ${t("wizard.inLocation")} ${hoods[0]}`
        : ` ${t("wizard.inLocation")} ${hoods.slice(0, -1).join(", ")} ${t("wizard.and")} ${hoods[hoods.length - 1]}`

  return t("wizard.completionBody", { hoods: hoodsClause })
}

export default function Wizard({
  config,
  onFinish,
  processingMessage,
  completion,
  collectNameOnIntro = true,
  progressLabel,
  listings
}: WizardProps) {
  const router = useRouter()
  const { setMode, setFilters, completeOnboarding, visitorName, setVisitorName } = useDiscover()
  const { t, locale } = useTranslation()

  // Same question id ("property_type") means something different in each
  // config, so personalizeTitle needs to know which flow it's phrasing for.
  const isSellerFlow = config.id === "seller-onboarding"

  // Swaps every step's title/subtitle/description/cta/placeholder/option
  // labels to English when needed — the config's own ids/conditions/values
  // never change, so useWizard's step logic is unaffected by locale.
  const localizedConfig = useMemo(() => localizeConfig(config, locale), [config, locale])

  const [showSplash, setShowSplash] = useState(true)

  const {
    currentStepData,
    currentQuestion,
    questionSteps,
    currentQuestionNumber,
    totalQuestions,
    answers,
    isFirstStep,
    setAnswer,
    next,
    back,
    reset,
    getSummary
  } = useWizard(
    localizedConfig,
    // Pre-fills a "full_name"-style question (e.g. the seller flow) when the
    // visitor already gave their name earlier in this session. Harmless for
    // configs with no such question — it just sits unused in the answers map.
    visitorName ? { full_name: visitorName } : undefined
  )

  // The #1 curated match for the completion screen's preview card — the
  // exact same buildDeck() call /selection makes, so the card shown here is
  // guaranteed to be whatever "Ver mi selección" actually opens on first.
  // Flows with no listings (the seller flow) simply never get a topMatch.
  const topMatch = useMemo<{ listing: Listing; mode: ReturnType<typeof mapWizardAnswersToFilters>["mode"] } | null>(() => {
    if (!listings || listings.length === 0) return null
    const { mode, filters } = mapWizardAnswersToFilters(answers)
    const listing = buildDeck(listings, filters, mode, []).deck[0]
    return listing ? { listing, mode } : null
  }, [listings, answers])

  // Name is captured right on the welcome screen (unless collectNameOnIntro
  // is false, e.g. the seller flow asks for it later as a regular
  // question) — local-only state until submitted as part of a real lead.
  const [nameInput, setNameInput] = useState(() => visitorName)

  // Flows that don't collect the name on intro (the seller flow) ask for it
  // later as a plain "full_name" question — propagate that into the same
  // shared visitorName as soon as it's answered, so later moments in THIS
  // pass (and other pages, once they navigate away) can address them by name.
  useEffect(() => {
    const answer = answers.full_name?.value
    if (typeof answer !== "string") return

    const name = capitalize(answer)
    if (name && name !== visitorName) {
      setVisitorName(name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visitorName/setVisitorName intentionally excluded, only re-run when the answer itself changes
  }, [answers.full_name?.value])

  // Every step (intro/question/summary/completion) goes through the same
  // beat: a short "typing" pause, then Wee's message types itself out, then
  // — once done — the interactive part (options/input/CTA) slides in.
  // "processing" reuses typing→message for display only; its actual
  // advance is driven by the async effect below.
  const [phase, setPhase] = useState<MessagePhase>("typing")

  // Distinguishes "just answered this question, about to auto-advance" (~600ms,
  // composer should hide) from "revisited an old answer via Back" (composer
  // should stay, pre-filled, so editing it is possible) — both have
  // answers[id] set, but only the first should suppress the composer.
  const [justAnswered, setJustAnswered] = useState(false)

  // Tracks which step `phase` currently belongs to. Resetting phase in a
  // useEffect (keyed on currentStepData?.id) left a window where React had
  // already committed a render for the NEW step while phase still held the
  // OLD step's value ("message"/"action") — since effects only run after
  // paint — which let a question's AssistantMessage mount, start typing,
  // then get yanked back to the typing-dots bubble a beat later when the
  // effect finally caught up, sometimes never settling on "action" at all.
  // Adjusting state directly during render (React's documented pattern for
  // "reset state when a prop changes") fixes this — the correction happens
  // before anything paints, so there's no stale intermediate render.
  const [phaseStepId, setPhaseStepId] = useState<string | undefined>(undefined)

  if (currentStepData && currentStepData.id !== phaseStepId) {
    setPhaseStepId(currentStepData.id)
    setJustAnswered(false)
    // Revisiting an already-answered question (e.g. after "Back") skips
    // straight to the interactive state — no need to replay the typing beat.
    setPhase(currentStepData.type === "question" && answers[currentStepData.id] ? "action" : "typing")
  }

  useEffect(() => {
    if (phase !== "typing") return
    const timer = setTimeout(() => setPhase("message"), 2000)
    return () => clearTimeout(timer)
  }, [phase, phaseStepId])

  // Auto-advances shortly after an answer is submitted. This has to be an
  // effect (not a setTimeout called directly inside the submit handler) —
  // `next` is a useCallback that closes over `canContinue`, which is still
  // false at the moment of submission (the answer hasn't been recorded
  // yet). A setTimeout capturing that stale `next` would silently no-op
  // 600ms later since canContinue still reads false inside its closure.
  // Effects re-run with the freshest `next` once canContinue catches up.
  useEffect(() => {
    if (!justAnswered) return
    const timer = setTimeout(() => next(), 600)
    return () => clearTimeout(timer)
  }, [justAnswered, next])

  function handleTypingDone() {
    setTimeout(() => setPhase("action"), 1000)
  }

  // Auto-scroll the transcript to the latest content — on step/phase changes,
  // and continuously while the typewriter is actively growing the message.
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentStepData?.id, phase])

  useEffect(() => {
    if (phase !== "message") return
    const interval = setInterval(scrollToBottom, 200)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (currentStepData?.type !== "processing") return

    // Entering "processing" means the visitor confirmed their answers on the
    // summary step. Default (buyer) behavior applies them as real Discover
    // filters; a custom onFinish (e.g. the seller flow, submitting a real
    // lead) replaces that entirely. Either way, no contact info reaches the
    // server here unless the flow explicitly collects and submits it itself.
    //
    // Advancing to "completion" waits on BOTH a minimum delay (so the
    // "thinking" animation doesn't just flash by) and the actual async work
    // — a real network submission can take longer than 2s, and we don't
    // want to show "all done!" before it's actually done. onFinish is
    // expected to handle its own errors (e.g. a toast) and still resolve, so
    // this never gets stuck waiting on a rejected promise.
    let cancelled = false

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 2600))
    const work = onFinish
      ? Promise.resolve(onFinish(getSummary()))
      : Promise.resolve().then(() => {
          const { mode, filters } = mapWizardAnswersToFilters(getSummary())
          setMode(mode)
          setFilters(filters)
        })

    completeOnboarding()

    Promise.all([work, minDelay]).then(() => {
      if (!cancelled) next()
    })

    return () => {
      cancelled = true
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- getSummary/setMode/setFilters/completeOnboarding/onFinish intentionally excluded, only re-run when the step itself changes
  }, [currentStepData, next])

  function handleNext() {
    next()
  }

  function handleIntroContinue() {
    const trimmed = nameInput.trim()
    if (!trimmed) return

    setVisitorName(capitalize(trimmed))
    next()
  }

  function handleSkipAssistant() {
    const trimmed = nameInput.trim()
    if (trimmed) setVisitorName(capitalize(trimmed))

    completeOnboarding()
    router.push("/profile")
  }

  function handleClose() {
    completeOnboarding()
    router.push("/")
  }

  function handleContinueToSelection() {
    router.push("/selection")
  }

  function handleRestart() {
    reset()
  }

  function handleAnswerSubmit(value: string | string[] | number) {
    if (!currentQuestion) return

    // "Vender" branches away entirely — it's a different flow (property +
    // contact info for a staff agent), not another filter value.
    if (currentQuestion.id === "intent" && value === "sell") {
      router.push("/wizard/sell")
      return
    }

    setAnswer(currentQuestion.id, value)
    setJustAnswered(true)
  }

  if (!currentStepData) {
    return null
  }

  // Name capture happens on its own screen, before the chat even mounts —
  // so the very first thing Wee says already addresses the visitor by name,
  // instead of having to ask for it as the opening exchange. Flows that
  // don't collect the name here (the seller flow, which asks later as a
  // regular question) skip straight to the chat UI below.
  if (currentStepData.type === "intro" && collectNameOnIntro) {
    return (
      <main className="theme-weeggo relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
        {showSplash && <Splash onComplete={() => setShowSplash(false)} />}

        {!showSplash && (
          <div className="relative h-full w-full overflow-hidden">
            <IntroWaveBackground />

            <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-12 text-center">
              <AssistantAvatar size={72} />

              <h1 className="mt-4 max-w-lg text-xl font-light leading-tight tracking-[-0.04em] text-foreground">
                {interpolateName(currentStepData.title ?? "", visitorName)}
              </h1>

              {currentStepData.description && (
                <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                  {interpolateName(currentStepData.description, visitorName)}
                </p>
              )}

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleIntroContinue()
                }}
                placeholder={t("wizard.namePlaceholder")}
                autoFocus
                className="mt-6 w-full max-w-md rounded-full border border-border bg-card px-6 py-4 text-center text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[var(--weeggo-orange)]"
              />

              <button
                type="button"
                onClick={handleIntroContinue}
                disabled={!nameInput.trim()}
                className="mt-6 h-14 w-full max-w-md rounded-full bg-orange-500 text-md font-medium text-white transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                {currentStepData.cta ?? t("common.start")}
              </button>

              <button
                type="button"
                onClick={handleSkipAssistant}
                className="mt-4 text-xs font-semibold text-muted-foreground underline underline-offset-2"
              >
                {t("wizard.skipAssistant")}
              </button>
            </div>
          </div>
        )}
      </main>
    )
  }

  const initials = visitorName ? visitorName.slice(0, 2).toUpperCase() : ""

  // Every question step before the current one (or all of them, once we've
  // moved past questions entirely) renders as settled transcript history.
  const answeredCount =
    currentStepData.type === "intro"
      ? 0
      : currentQuestion
        ? currentQuestionNumber - 1
        : questionSteps.length

  const historyQuestions = questionSteps.slice(0, answeredCount)

  const defaultCompletionHeading = visitorName
    ? t("wizard.completionHeading", { name: visitorName })
    : t("wizard.completionHeadingGeneric")

  let composeSlot: React.ReactNode = null

  if (currentStepData.type === "intro") {
    // Only reachable when collectNameOnIntro is false (the seller flow) —
    // the name-collecting case returns its own standalone screen above,
    // before the chat UI (and this composeSlot logic) ever mounts.
    if (phase === "action") {
      composeSlot = (
        <div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-3 safe-bottom">
          <button
            type="button"
            onClick={handleNext}
            className="h-12 rounded-full text-[14px] font-bold text-white transition active:scale-[0.98]"
            style={{ background: "var(--weeggo-orange)" }}
          >
            {currentStepData.cta ?? t("common.start")}
          </button>
        </div>
      )
    }
  } else if (currentQuestion && phase === "action" && !justAnswered) {
    // Shown even when this question already has an answer (revisited via
    // Back) — pre-filled from that answer, so editing it just resubmits.
    // Hidden only during the brief transition right after a fresh answer
    // (justAnswered), while we're about to auto-advance to the next one.
    composeSlot = (
      <AnswerComposer
        key={currentQuestion.id}
        question={currentQuestion}
        value={answers[currentQuestion.id]?.value}
        onSubmit={handleAnswerSubmit}
      />
    )
  } else if (currentStepData.type === "summary" && phase === "action") {
    composeSlot = (
      <div className="border-t border-border bg-card px-4 py-3 safe-bottom">
        <button
          type="button"
          onClick={handleNext}
          className="h-12 w-full rounded-full text-[14px] font-bold text-white transition active:scale-[0.98]"
          style={{ background: "var(--weeggo-orange)" }}
        >
          {t("common.continue")}
        </button>
      </div>
    )
  } else if (currentStepData.type === "completion" && phase === "action") {
    composeSlot = (
      <div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-3 safe-bottom">
        <button
          type="button"
          onClick={completion?.onCta ?? handleContinueToSelection}
          className="h-12 rounded-full text-[14px] font-bold text-white transition active:scale-[0.98]"
          style={{ background: "var(--weeggo-orange)" }}
        >
          {completion?.ctaLabel ?? t("wizard.viewSelection")}
        </button>
        {completion?.showRestart !== false && (
          <button
            type="button"
            onClick={handleRestart}
            className="text-center text-[13px] font-semibold text-muted-foreground underline"
          >
            {t("wizard.startOver")}
          </button>
        )}
      </div>
    )
  }

  return (
    <main className="theme-weeggo relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">

      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}

      {!showSplash && (
        <>
          <ChatHeader
            showBack={currentStepData.type === "question" && !isFirstStep}
            onBack={back}
            onClose={handleClose}
          />

          {currentStepData.type === "question" && (
            <Progress
              current={currentQuestionNumber}
              total={totalQuestions}
              label={progressLabel}
              showCounter
            />
          )}

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">

            {historyQuestions.map((q) => (
              <div key={q.id} className="space-y-3">
                <AssistantMessage text={personalizeTitle(q, visitorName, answers, isSellerFlow, locale)} />
                <UserMessage text={formatAnswerAsMessage(q, answers[q.id])} initials={initials} />
              </div>
            ))}

            {currentStepData.type === "intro" && (
              <div className="space-y-3">
                {phase === "typing" ? (
                  <TypingBubble />
                ) : (
                  <AssistantMessage
                    key={currentStepData.id}
                    text={interpolateName(currentStepData.description ?? currentStepData.title ?? "", visitorName)}
                    typewriter={phase === "message"}
                    onTypingDone={handleTypingDone}
                  />
                )}
              </div>
            )}

            {currentQuestion && (
              <div className="space-y-3">
                {phase === "typing" ? (
                  <TypingBubble />
                ) : (
                  <AssistantMessage
                    key={currentQuestion.id}
                    text={personalizeTitle(currentQuestion, visitorName, answers, isSellerFlow, locale)}
                    typewriter={phase === "message"}
                    onTypingDone={handleTypingDone}
                  />
                )}

                {phase === "action" && answers[currentQuestion.id] && (
                  <UserMessage
                    text={formatAnswerAsMessage(currentQuestion, answers[currentQuestion.id])}
                    initials={initials}
                  />
                )}
              </div>
            )}

            {currentStepData.type === "summary" && (
              <div className="space-y-3">
                {phase === "typing" ? (
                  <TypingBubble />
                ) : (
                  <AssistantMessage
                    key={currentStepData.id}
                    text={
                      visitorName
                        ? t("wizard.summaryReady", { name: visitorName })
                        : t("wizard.summaryReadyGeneric")
                    }
                    typewriter={phase === "message"}
                    onTypingDone={handleTypingDone}
                  />
                )}
              </div>
            )}

            {currentStepData.type === "processing" && (
              <div className="space-y-3">
                {phase === "typing" ? (
                  <TypingBubble />
                ) : (
                  <AssistantMessage
                    key={currentStepData.id}
                    text={
                      processingMessage
                        ? processingMessage(answers, visitorName)
                        : buildProcessingMessage(answers, visitorName, t)
                    }
                    typewriter={phase === "message"}
                  />
                )}
              </div>
            )}

            {currentStepData.type === "completion" && (
              <div className="space-y-3">
                {phase === "typing" ? (
                  <TypingBubble />
                ) : (
                  <>
                    <AssistantMessage
                      key={currentStepData.id}
                      text={`${completion?.heading ?? defaultCompletionHeading} ${completion?.body ?? buildCompletionBody(answers, t)}`}
                      typewriter={phase === "message"}
                      onTypingDone={handleTypingDone}
                    />
                    {topMatch && (
                      <MatchPreviewCard listing={topMatch.listing} mode={topMatch.mode} t={t} />
                    )}
                  </>
                )}
              </div>
            )}

          </div>

          {composeSlot}
        </>
      )}

    </main>
  )
}
