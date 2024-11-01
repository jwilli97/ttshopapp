// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // If there's an error parameter, handle it
    if (error) {
      console.error('Auth error:', error, error_description)
      return NextResponse.redirect(
        new URL(`/auth/error?error=${error}&description=${error_description}`, request.url)
      )
    }

    // If no code is present, redirect to sign-in
    if (!code) {
      console.error('No code present in callback')
      return NextResponse.redirect(new URL('/createAccount/Pending', request.url))
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Session exchange error:', exchangeError.message)
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

      // Successful auth - redirect to dashboard or home
      return NextResponse.redirect(new URL('/createAccount/FirstLogIn', request.url))
    } catch (supabaseError) {
      console.error('Supabase client error:', supabaseError)
      return NextResponse.redirect(
        new URL(`/auth/error?error=supabase_client_error&description=${encodeURIComponent((supabaseError as Error).message)}`, request.url)
      )
    }
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(
      new URL(`/auth/error?error=unexpected_error&description=${encodeURIComponent((err as Error).message)}`, request.url)
    )
  }
}