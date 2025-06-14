import { db } from "@/server/db/config/database"
import { workspaces } from "@/server/db/schemas"
import { eq } from "drizzle-orm"

import { TagType } from "@/types/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChartMultiple, BarChartMultipleSkeleton } from "@/components/charts/bar-chart-multiple"
import { Icons } from "@/components/global/icons"

type AnalyticsBarchartProps = {
  slug: string
}

export async function AnalyticsBarchart({ slug }: AnalyticsBarchartProps) {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
    with: {
      items: true,
    },
  })

  if (!workspace) {
    return null
  }

  const dbItems = workspace.items

  const chartData = [
    {
      tag: "Next.Js",
      bar1: dbItems.filter((item) =>
        (item.tags as TagType[]).some((tag) => tag.value === "next.js")
      ).length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "next.js") && item.dueDate !== null
      ).length,
    },
    {
      tag: "SvelteKit",
      bar1: dbItems.filter((item) =>
        (item.tags as TagType[]).some((tag) => tag.value === "sveltekit")
      ).length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "sveltekit") && item.dueDate !== null
      ).length,
    },
    {
      tag: "Vue.js",
      bar1: dbItems.filter((item) => (item.tags as TagType[]).some((tag) => tag.value === "vue"))
        .length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "vue") && item.dueDate !== null
      ).length,
    },
    {
      tag: "React",
      bar1: dbItems.filter((item) => (item.tags as TagType[]).some((tag) => tag.value === "react"))
        .length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "react") && item.dueDate !== null
      ).length,
    },
    {
      tag: "Gatsby",
      bar1: dbItems.filter((item) => (item.tags as TagType[]).some((tag) => tag.value === "gatsby"))
        .length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "gatsby") && item.dueDate !== null
      ).length,
    },
    {
      tag: "Astro",
      bar1: dbItems.filter((item) => (item.tags as TagType[]).some((tag) => tag.value === "astro"))
        .length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "astro") && item.dueDate !== null
      ).length,
    },
    {
      tag: "Remix",
      bar1: dbItems.filter((item) => (item.tags as TagType[]).some((tag) => tag.value === "remix"))
        .length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "remix") && item.dueDate !== null
      ).length,
    },
    {
      tag: "Angular",
      bar1: dbItems.filter((item) =>
        (item.tags as TagType[]).some((tag) => tag.value === "angular")
      ).length,
      bar2: dbItems.filter(
        (item) =>
          (item.tags as TagType[]).some((tag) => tag.value === "angular") && item.dueDate !== null
      ).length,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Icons.chart className="mr-2 size-4" />
          Active Items
        </CardTitle>
        <CardDescription>All items that are currently active in the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChartMultiple bar1Label="No due date" bar2Label="With due date" chartData={chartData} />
      </CardContent>
    </Card>
  )
}

export async function AnalyticsBarchartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-80" />
      </CardHeader>
      <CardContent>
        <BarChartMultipleSkeleton />
      </CardContent>
    </Card>
  )
}
