import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the URL to redirect to after verification
    const redirectTo = `${requestUrl.origin}/createAccount/FirstLogIn`

    // Return redirect response that works on both web and mobile
    return NextResponse.redirect(redirectTo)
  }

  // Handle error case
  return NextResponse.redirect(`${requestUrl.origin}/error`)
}
