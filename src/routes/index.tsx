import { createFileRoute, Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{m.common_app_name()}</CardTitle>
          <CardDescription>
            {m.auth_landing_description()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link to="/login">{m.auth_sign_in()}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">{m.auth_sign_up_title()}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
