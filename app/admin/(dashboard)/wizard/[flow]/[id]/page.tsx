import { notFound } from "next/navigation";

import { wizardQuestionsStore } from "@/app/admin/_lib/store";
import { updateWizardQuestionAction } from "@/app/admin/_lib/actions/wizard";
import { isWizardFlow } from "@/app/admin/_lib/wizard-constants";
import { PageHeader } from "@/app/admin/_components/page-header";
import { WizardQuestionForm } from "@/app/admin/(dashboard)/wizard/_components/wizard-question-form";

export default async function EditWizardQuestionPage({
  params,
}: {
  params: Promise<{ flow: string; id: string }>;
}) {
  const { flow, id } = await params;
  if (!isWizardFlow(flow)) notFound();

  const [question, allQuestions] = await Promise.all([
    wizardQuestionsStore.get(id),
    wizardQuestionsStore.list(flow),
  ]);
  if (!question) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={question.title} description="Editá la pregunta y sus opciones." />
      <WizardQuestionForm
        flow={flow}
        question={question}
        action={updateWizardQuestionAction.bind(null, flow, id)}
        otherQuestions={allQuestions.filter((q) => q.id !== id)}
      />
    </div>
  );
}
