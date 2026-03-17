import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Label } from "#/components/ui/label";
import { setLocale, getLocale, locales } from "#/paraglide/runtime";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
  "/_protected/_onboarded/org/account/preferences",
)({
  component: PreferencesPage,
});

const LOCALE_LABELS: Record<string, () => string> = {
  en: () => m.settings_preferences_locale_en(),
  nl: () => m.settings_preferences_locale_nl(),
};

function PreferencesPage() {
  const currentLocale = getLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.settings_preferences_title()}</CardTitle>
        <CardDescription>
          {m.settings_preferences_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>{m.settings_preferences_locale_label()}</Label>
          <Select
            defaultValue={currentLocale}
            onValueChange={(val: string | null) => {
              if (val) {
                setLocale(val as (typeof locales)[number]);
              }
            }}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  {LOCALE_LABELS[locale]?.() ?? locale}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] text-muted-foreground">
            {m.settings_preferences_language_description()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
