import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TiterDial, type TiterDirection } from "@/components/titer/titer-dial";

interface ToolPlaceholderProps {
  name: string;
  description: string;
  direction: TiterDirection;
  inputLabel: string;
  inputPlaceholder: string;
  multiline?: boolean;
  actionLabel: string;
  phaseNote: string;
}

export function ToolPlaceholder({
  name,
  description,
  direction,
  inputLabel,
  inputPlaceholder,
  multiline,
  actionLabel,
  phaseNote,
}: ToolPlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-secondary-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{inputLabel}</CardTitle>
          <CardDescription>{phaseNote}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-3">
            {multiline ? (
              <textarea
                disabled
                placeholder={inputPlaceholder}
                rows={6}
                className="w-full resize-none rounded-md border border-input bg-input/30 px-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
              />
            ) : (
              <input
                disabled
                placeholder={inputPlaceholder}
                className="w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
              />
            )}
            <div>
              <Button disabled>{actionLabel}</Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:w-48">
            <Badge variant="secondary">Not wired up yet</Badge>
            <TiterDial score={0} direction={direction} verdict="Awaiting engine" size={120} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
