import { createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Archvault</CardTitle>
          <CardDescription>
            Visual C4 architecture platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/signup">Create Account</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
