// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)
  const cookieStore = cookies()
  
  console.log('Auth callback initiated:', {
    isMobile,
    userAgent: userAgent.substring(0, 100), // Truncate for logging
    cookies: cookieStore.getAll().map(c => c.name) // Log cookie names for debugging
  })

  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    if (error) {
      console.error('Auth error:', { error, error_description, isMobile })
      return NextResponse.redirect(
        new URL(`/auth/error?error=${error}&description=${error_description}`, request.url)
      )
    }

    if (!code) {
      console.error('No code present in callback')
      return NextResponse.redirect(new URL('/createAccount/Pending', request.url))
    }

    // Initialize Supabase with specific cookie options for mobile
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    })

    try {
      // Exchange code for session with enhanced error handling
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Session exchange error:', {
          error: exchangeError.message,
          isMobile,
          cookiesPresent: cookieStore.getAll().length > 0
        })
        return NextResponse.redirect(
          new URL(`/auth/error?error=session_exchange_failed&description=${exchangeError.message}`, request.url)
        )
      }

      if (!data.session) {
        console.error('No session data returned')
        return NextResponse.redirect(
          new URL('/auth/error?error=no_session_data', request.url)
        )
      }

      // Create response with redirect
      const response = NextResponse.redirect(new URL('/createAccount/FirstLogIn', request.url))

      // Explicitly set auth cookie with mobile-friendly options
      const sessionStr = JSON.stringify(data.session)
      response.cookies.set('supabase-auth-token', sessionStr, {
        path: '/',
        secure: true,
        sameSite: 'lax', // Less strict than 'strict', more compatible with mobile
        maxAge: 60 * 60 * 24 * 7, // 1 week
        domain: new URL(request.url).hostname
      })

      return response

    } catch (supabaseError) {
      console.error('Supabase client error:', {
        error: supabaseError,
        isMobile,
        cookiesPresent: cookieStore.getAll().length > 0
      })
      return NextResponse.redirect(
        new URL(`/auth/error?error=supabase_client_error&description=${encodeURIComponent((supabaseError as Error).message)}`, request.url)
      )
    }
  } catch (err) {
    console.error('Callback error:', {
      error: err,
      isMobile,
      cookiesPresent: cookieStore.getAll().length > 0
    })
    return NextResponse.redirect(
      new URL('/auth/error?error=unexpected_error', request.url)
    )
  }
}