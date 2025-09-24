import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Optimisation : vérifier seulement si nécessaire
  const publicPaths = ['/auth', '/auth/login', '/auth/signup', '/auth/callback', '/auth/reset-password']
  const isPublic = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  // Si c'est une route publique, pas besoin de vérifier l'auth
  if (isPublic) {
    return res
  }

  // Vérifier l'auth seulement pour les routes protégées
  const { data: { user } } = await supabase.auth.getUser()

  // Si user n'est pas authentifié et essaie d'accéder à une route protégée
  if (!user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
