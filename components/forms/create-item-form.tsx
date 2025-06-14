"use client"

import { ComponentProps } from "react"
import { useParams } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"
import { useCreateItemTRPC } from "@/trpc/hooks/items-hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { createItemSchema } from "@/lib/schemas"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import MultipleSelector, { Option } from "@/components/ui/multiselect"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/global/icons"

const frameworks: Option[] = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js", disable: true },

  { value: "vue", label: "Vue.js" },
  { value: "react", label: "React" },

  { value: "gatsby", label: "Gatsby" },
  { value: "eleventy", label: "Eleventy", disable: true },
  { value: "astro", label: "Astro" },
  { value: "remix", label: "Remix" },
  { value: "angular", label: "Angular" },
]

type CreateItemFormProps = {} & ComponentProps<typeof Card>

export function CreateItemForm({ className }: CreateItemFormProps) {
  const params = useParams()
  const slug = params.slug as WorkspaceType["slug"]

  const form = useForm<z.infer<typeof createItemSchema>>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: undefined,
      tags: [],
      status: "todo",
      slug,
    },
  })

  const { mutate, isPending } = useCreateItemTRPC({
    onSuccess: () => {
      form.reset()
    },
  })

  const onSubmit = (values: z.infer<typeof createItemSchema>) => {
    mutate(values)
  }

  const isLoading = form.formState.isSubmitting || isPending
  const isDisabledForm = isPending || isLoading

  return (
    <Card className={cn("w-full border-none shadow-none", className)}>
      <CardHeader className="sr-only">
        <CardTitle className="text-base">Create new item</CardTitle>
        <CardDescription>Create a new item to get started</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 p-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" disabled={isLoading} autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Item description"
                      disabled={isLoading}
                      className="bg-background-subtle max-h-56"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="select-16" className="bg-background">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value}
                      defaultOptions={frameworks}
                      placeholder="Select frameworks"
                      hideClearAllButton
                      hidePlaceholderWhenSelected
                      onChange={field.onChange}
                      emptyIndicator={<p className="text-center text-sm">No results found</p>}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover modal={false}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <Icons.calendar className="ml-auto opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Date is used to display date.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="justify-end p-0">
            <Button type="submit" disabled={isDisabledForm}>
              {isPending ? (
                <>
                  <Icons.loader className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create item"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
