import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/projects'
        const redirectResponse = NextResponse.redirect(url)
        // Copy cookies to maintain session if it was refreshed
        const cookies = supabaseResponse.cookies.getAll()
        cookies.forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie))
        return redirectResponse
    }

    if (!user && (request.nextUrl.pathname.startsWith('/projects') || request.nextUrl.pathname.startsWith('/dashboard'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        // Copy cookies (though mostly empty/invalid) just in case
        const cookies = supabaseResponse.cookies.getAll()
        cookies.forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie))
        return redirectResponse
    }

    return supabaseResponse
}
