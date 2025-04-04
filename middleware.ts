import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis, ratelimit as rateLimitConfig } from '@/lib/redis'

// Initialize different rate limiters
const defaultLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    rateLimitConfig.default.max,
    `${rateLimitConfig.default.window} s`
  ),
  analytics: true,
})

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    rateLimitConfig.auth.max,
    `${rateLimitConfig.auth.window} s`
  ),
  analytics: true,
})

const orderLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    rateLimitConfig.order.max,
    `${rateLimitConfig.order.window} s`
  ),
  analytics: true,
})

// Define route configurations
const publicRoutes = [
  '/',
  '/auth/welcome',
  '/auth/signUp',
  '/auth/create-profile',
  '/auth/callback',
  '/auth/verify',
  '/api/checkSupaAccount',
  '/api/checkAccount',
  '/api/squareSignUp'
];

const protectedRoutes = [
  '/dashboard',
  '/Account',
  '/Order',
  '/api/createProfile',
  '/api/getLoyaltyBalance',
  '/api/redeemRewards'
];

const adminRoutes = [
  '/Admin',
  '/api/menuOperations'
];

// Cache for session data with automatic cleanup
const sessionCache = new Map();
const SESSION_CACHE_TIME = 60 * 1000; // 1 minute

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > SESSION_CACHE_TIME) {
      sessionCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const path = request.nextUrl.pathname

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const identifier = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Apply rate limiting based on route type
    if (path.startsWith('/api/')) {
      let limiter = defaultLimiter
      
      if (path.includes('/auth/')) {
        limiter = authLimiter
      } else if (path.includes('/Order/')) {
        limiter = orderLimiter
      }

      const { success, limit, reset, remaining } = await limiter.limit(identifier)
      
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        })
      }
    }

    // Enhanced CSRF Protection
    if (path.startsWith('/api/') && request.method !== 'GET') {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      
      if (!origin || !host || !origin.includes(host)) {
        return new NextResponse('Invalid Origin', { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
    }

    // Check if route is public
    if (publicRoutes.some(route => path.startsWith(route))) {
      return res
    }

    // Enhanced Session Management with Caching
    let session
    const sessionToken = request.cookies.get('sb-token')?.value
    const cachedSession = sessionToken ? sessionCache.get(sessionToken) : null
    
    if (cachedSession && Date.now() - cachedSession.timestamp < SESSION_CACHE_TIME) {
      session = cachedSession.session
    } else {
      const { data: { session: newSession } } = await supabase.auth.getSession()
      session = newSession
      
      if (session && sessionToken) {
        sessionCache.set(sessionToken, {
          session,
          timestamp: Date.now()
        })
      }
    }

    // Handle protected routes
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

    // If no session, redirect to login
    if (!session) {
      if (isProtectedRoute || isAdminRoute) {
        const redirectUrl = new URL('/auth/welcome', request.url)
        redirectUrl.searchParams.set('returnTo', path)
        return NextResponse.redirect(redirectUrl)
      }
      return res
    }

    // Enhanced Admin Route Handling
    if (isAdminRoute) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single()
        
        if (error) throw error
        
        if (!data?.is_admin) {
          return new NextResponse('Unauthorized', { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          })
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        return new NextResponse('Internal Server Error', { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
    }

    // Enhanced Security Headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.headers.set('X-XSS-Protection', '1; mode=block')
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Update matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 