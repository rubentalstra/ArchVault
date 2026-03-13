import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";

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
      <span>Impersonating {session.user?.name ?? "user"}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        className="h-6 border-amber-700 bg-amber-400 text-amber-950 hover:bg-amber-300"
      >
        Stop
      </Button>
    </div>
  );
}
