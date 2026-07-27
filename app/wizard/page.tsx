import Wizard from "./components/Wizard"

import { buyerAssessment } from "./data/buyerAssessment"
import { getWizardQuestions } from "./lib/load-questions"
import { withQuestions } from "./lib/build-config"
import { getPublishedListings } from "@/lib/discover/listings"

export default async function WizardPage() {
  const [listings, questions] = await Promise.all([
    getPublishedListings(),
    getWizardQuestions("buyer"),
  ])

  return (
    <Wizard
      config={
        withQuestions(buyerAssessment, questions)
      }
      listings={listings}
    />
  )
}
