import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import { m } from "#/paraglide/messages";

export function ImpersonationBanner() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  if (!session?.session?.impersonatedBy) return null;

  const handleStop = async () => {
    await authClient.admin.stopImpersonating();
    navigate({ to: "/admin/users", search: {} as never });
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <span>{m.admin_impersonating({ name: session.user?.name ?? "user" })}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        className="h-6 border-amber-700 bg-amber-400 text-amber-950 hover:bg-amber-300"
      >
        {m.admin_impersonating_stop()}
      </Button>
    </div>
  );
}
