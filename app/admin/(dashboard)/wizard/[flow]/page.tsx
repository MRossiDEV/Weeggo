import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, Lock, Pencil, Plus, Trash2 } from "lucide-react";

import { wizardQuestionsStore } from "@/app/admin/_lib/store";
import {
  deleteWizardQuestionAction,
  moveWizardQuestionAction,
  toggleWizardQuestionStatusAction,
} from "@/app/admin/_lib/actions/wizard";
import { PROTECTED_STEP_KEYS, WIZARD_FLOWS, isWizardFlow } from "@/app/admin/_lib/wizard-constants";
import { PageHeader } from "@/app/admin/_components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QUESTION_TYPE_LABEL: Record<string, string> = {
  single: "Selección única",
  multiple: "Selección múltiple",
  select: "Lista desplegable",
  text: "Texto libre",
  email: "Email",
  phone: "Teléfono",
  number: "Número",
  range: "Rango",
  location: "Ubicación",
  currency: "Moneda",
};

const OPERATOR_LABEL: Record<string, string> = {
  equals: "es igual a",
  not_equals: "es distinto de",
  contains: "contiene",
  greater_than: "es mayor que",
  less_than: "es menor que",
};

export default async function WizardFlowPage({
  params,
}: {
  params: Promise<{ flow: string }>;
}) {
  const { flow } = await params;
  if (!isWizardFlow(flow)) notFound();

  const questions = await wizardQuestionsStore.list(flow);
  const protectedKeys = PROTECTED_STEP_KEYS[flow];

  const deleteAction = deleteWizardQuestionAction.bind(null, flow);
  const toggleStatusAction = toggleWizardQuestionStatusAction.bind(null, flow);
  const moveAction = moveWizardQuestionAction.bind(null, flow);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Asistente"
        description="Editá las preguntas y opciones del asistente para probar y optimizar la conversión."
        action={
          <Button render={<Link href={`/admin/wizard/${flow}/new`} />}>
            <Plus />
            Nueva pregunta
          </Button>
        }
      />

      <div className="flex gap-2 border-b border-border">
        {WIZARD_FLOWS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/wizard/${f.value}`}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              f.value === flow
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Orden</TableHead>
              <TableHead>Pregunta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Opciones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question, index) => {
              const isProtected = protectedKeys.includes(question.stepKey);
              return (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <form action={moveAction}>
                        <input type="hidden" name="id" value={question.id} />
                        <input type="hidden" name="direction" value="up" />
                        <Button variant="ghost" size="icon-sm" type="submit" disabled={index === 0}>
                          <ArrowUp />
                        </Button>
                      </form>
                      <form action={moveAction}>
                        <input type="hidden" name="id" value={question.id} />
                        <input type="hidden" name="direction" value="down" />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="submit"
                          disabled={index === questions.length - 1}
                        >
                          <ArrowDown />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{question.title}</div>
                    <div className="font-weeggo-mono text-xs text-muted-foreground">{question.stepKey}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {QUESTION_TYPE_LABEL[question.questionType] ?? question.questionType}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {question.condition
                      ? `si ${question.condition.stepKey} ${OPERATOR_LABEL[question.condition.operator]} "${question.condition.value}"`
                      : "—"}
                  </TableCell>
                  <TableCell className="font-weeggo-mono text-muted-foreground">
                    {question.options.length || "—"}
                  </TableCell>
                  <TableCell>
                    <form action={toggleStatusAction}>
                      <input type="hidden" name="id" value={question.id} />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value={question.status === "published" ? "draft" : "published"}
                      />
                      <button type="submit">
                        <Badge variant={question.status === "published" ? "default" : "secondary"}>
                          {question.status === "published" ? "Publicada" : "Borrador"}
                        </Badge>
                      </button>
                    </form>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/admin/wizard/${flow}/${question.id}`} />}
                      >
                        <Pencil />
                      </Button>
                      {isProtected ? (
                        <Button variant="ghost" size="icon-sm" disabled title="Requerida por el sistema — no se puede eliminar">
                          <Lock />
                        </Button>
                      ) : (
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={question.id} />
                          <input type="hidden" name="stepKey" value={question.stepKey} />
                          <Button variant="ghost" size="icon-sm" type="submit">
                            <Trash2 />
                          </Button>
                        </form>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
