import { cn } from "@/lib/utils"
import { Icons } from "@/components/global/icons"

type NotificationIllustrationProps = {
  primary?: boolean
}

export function NotificationIllustration({ primary = false }: NotificationIllustrationProps) {
  return (
    <div
      className={cn("h-10 w-36 rounded-md border border-border bg-card p-1", {
        "border-primary/30": primary,
      })}
    >
      <div className="flex size-full items-center overflow-hidden rounded-md border border-accent">
        <div className="ml-2 flex items-center gap-x-1">
          <div
            className={cn("w-fit rounded-md p-1", {
              "bg-primary/60": primary,
            })}
          >
            <Icons.bell
              className={cn("size-3 text-muted-foreground", {
                "text-muted": primary,
              })}
            />
          </div>
          <div className="space-y-1">
            <div
              className={cn("h-1.5 w-14 rounded-md bg-muted", {
                "bg-primary/60": primary,
              })}
            />
            <div
              className={cn("h-1.5 w-20 rounded-md bg-muted", {
                "bg-primary/60": primary,
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
