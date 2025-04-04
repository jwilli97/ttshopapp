import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limit configurations for different route types
export const ratelimit = {
  // Default API rate limit
  default: {
    window: 10,  // 10 seconds
    max: 10      // 10 requests per window
  },
  // Auth endpoints (more strict)
  auth: {
    window: 60,  // 60 seconds
    max: 5       // 5 requests per minute
  },
  // Order endpoints (more lenient)
  order: {
    window: 60,  // 60 seconds
    max: 20      // 20 requests per minute
  }
} 