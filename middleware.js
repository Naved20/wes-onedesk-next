import { createMiddlewareClient } from '@/integrations/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const res = NextResponse.next()
  const { pathname } = request.nextUrl
  
  // Allow auth page without session check
  if (pathname === '/auth') {
    return res
  }
  
  // Create Supabase client
  const supabase = createMiddlewareClient(request, res)
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect all routes except auth
  if (!session) {
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
    
    // Admin-only routes
    if (['/institutions', '/settings'].includes(pathname) && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Admin and Manager routes
    if (pathname === '/employees' && !['admin', 'manager'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
