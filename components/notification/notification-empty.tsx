import { NotificationIllustration } from "@/components/notification/notification-illustration"

type NotificationEmptyProps = {
  title: string
  desc?: string
}

export function NotificationEmpty({ title, desc }: NotificationEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2 overflow-hidden pb-5">
      <div className="mb-7 mt-20 flex w-full flex-col items-center justify-center space-y-2">
        <NotificationIllustration primary={true} />
        <NotificationIllustration />
        <NotificationIllustration />
        <NotificationIllustration />
      </div>
      <p>{title}</p>
      {desc && <p className="w-[40ch] px-4 text-center text-xs text-muted-foreground">{desc}</p>}
    </div>
  )
}
