import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Check if we have a specific redirect parameter
    if (redirectParam === 'profile') {
      // User came from the account creation flow, redirect to profile setup
      return NextResponse.redirect(`${requestUrl.origin}/CreateAccount?step=profile`)
    }

    // Default redirect for normal email verification
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // Handle error case
  return NextResponse.redirect(`${requestUrl.origin}/error`)
}
