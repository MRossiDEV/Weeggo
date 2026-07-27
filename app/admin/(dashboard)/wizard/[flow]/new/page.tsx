import { notFound } from "next/navigation";

import { wizardQuestionsStore } from "@/app/admin/_lib/store";
import { createWizardQuestionAction } from "@/app/admin/_lib/actions/wizard";
import { isWizardFlow } from "@/app/admin/_lib/wizard-constants";
import { PageHeader } from "@/app/admin/_components/page-header";
import { WizardQuestionForm } from "@/app/admin/(dashboard)/wizard/_components/wizard-question-form";

export default async function NewWizardQuestionPage({
  params,
}: {
  params: Promise<{ flow: string }>;
}) {
  const { flow } = await params;
  if (!isWizardFlow(flow)) notFound();

  const otherQuestions = await wizardQuestionsStore.list(flow);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nueva pregunta" description="Agregá una pregunta al asistente." />
      <WizardQuestionForm flow={flow} action={createWizardQuestionAction.bind(null, flow)} otherQuestions={otherQuestions} />
    </div>
  );
}
