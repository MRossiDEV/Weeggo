import { sellerOnboarding } from "../data/sellerOnboarding"
import { getWizardQuestions } from "../lib/load-questions"
import { withQuestions } from "../lib/build-config"
import SellWizardClient from "./SellWizardClient"

export default async function SellWizardPage() {
  const questions = await getWizardQuestions("seller")

  return <SellWizardClient config={withQuestions(sellerOnboarding, questions)} />
}
