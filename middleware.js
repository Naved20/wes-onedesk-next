import { createMiddlewareClient } from '@/integrations/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  const { pathname } = request.nextUrl
  
  // Create Supabase client
  const supabase = createMiddlewareClient(request, response)
  
  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log(`[Middleware] ${pathname} - Session:`, !!session)
  
  // Allow auth page without session check
  if (pathname === '/auth') {
    // If already logged in, redirect to dashboard
    if (session) {
      console.log('[Middleware] Already logged in, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }
  
  // Protect all routes except auth
  if (!session) {
    console.log('[Middleware] No session, redirecting to auth')
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Role-based access control
  if (session) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()
    
    const role = roleData?.role || 'employee'
    console.log(`[Middleware] User role: ${role}`)
    
    // Admin-only routes
    if (['/institutions', '/settings'].includes(pathname) && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Admin and Manager routes
    if (pathname === '/employees' && !['admin', 'manager'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
