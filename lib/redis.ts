import { UPSTASH_REDIS_REST_TOKEN_ENV, UPSTASH_REDIS_REST_URL_ENV } from "@/env"
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL_ENV,
  token: UPSTASH_REDIS_REST_TOKEN_ENV,
})
