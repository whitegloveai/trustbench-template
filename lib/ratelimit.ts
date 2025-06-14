import { Ratelimit } from "@upstash/ratelimit"

import { redis } from "@/lib/redis"

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10s"),
})
