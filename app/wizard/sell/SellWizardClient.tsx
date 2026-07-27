"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import Wizard from "../components/Wizard"
import { mapSellerAnswersToLead } from "../lib/seller-answers-to-lead"
import { submitSellerLead } from "../actions"
import { useDiscover } from "@/lib/discover/filters-context"
import { useTranslation } from "@/lib/i18n/useTranslation"
import type { WizardAnswer, WizardConfig } from "../types"

export default function SellWizardClient({ config }: { config: WizardConfig }) {
  const router = useRouter()
  const { visitorName } = useDiscover()
  const { t } = useTranslation()

  async function handleFinish(summary: Record<string, WizardAnswer>) {
    const { contact, property } = mapSellerAnswersToLead(summary)
    const result = await submitSellerLead(contact, property)

    if (!result.ok) {
      toast.error(t("sell.errorToast"))
    }
  }

  return (
    <Wizard
      config={config}
      collectNameOnIntro={false}
      progressLabel={t("sell.progressLabel")}
      onFinish={handleFinish}
      processingMessage={(_, name) =>
        name ? t("sell.sendingWithName", { name }) : t("sell.sendingGeneric")
      }
      completion={{
        heading: visitorName ? t("sell.thankYouWithName", { name: visitorName }) : t("sell.thankYouGeneric"),
        body: t("sell.completionBody"),
        ctaLabel: t("sell.backToHome"),
        onCta: () => router.push("/"),
        showRestart: false,
      }}
    />
  )
}
