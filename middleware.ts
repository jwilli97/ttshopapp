import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/Account', '/Order']
const adminRoutes = ['/Admin']

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Handle protected routes
  const path = request.nextUrl.pathname
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
  
  // If the route is protected and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If it's an admin route, check if the user is an admin
  if (isAdminRoute && session) {
    try {
      // Get the user's admin status
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single()
      
      if (error || !data?.is_admin) {
        // Not an admin, redirect to dashboard
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      // If there's an error, redirect to the dashboard to be safe
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // If admin route and no session, redirect to login
  if (isAdminRoute && !session) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files (.png, .svg, etc)
     * - API routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public).*)',
  ],
} 