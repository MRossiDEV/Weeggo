import { verifyInviteToken } from "@/lib/invite-token";
import { setPartnerPasswordAction } from "@/app/partner/_lib/actions/auth";
import { SetPasswordForm } from "./_components/set-password-form";

export default async function PartnerSetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const invite = verifyInviteToken(token, "partner");

  return (
    <div className="theme-weeggo flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="text-2xl font-extrabold text-foreground">Portal de Partners</h1>

        {invite ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Elegí una contraseña para completar tu cuenta.
            </p>
            <SetPasswordForm action={setPartnerPasswordAction.bind(null, token)} />
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Este link no es válido o venció. Pedile a un administrador que te reenvíe la invitación.
          </p>
        )}
      </div>
    </div>
  );
}
