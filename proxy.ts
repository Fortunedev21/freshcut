import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const userRole = token?.role as string | undefined

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const isBoss = pathname.startsWith('/admin/boss')
    const isCoiffeur = pathname.startsWith('/admin/coiffeur')

    if (isBoss && userRole !== 'BOSS' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
    }

    if (isCoiffeur && userRole !== 'COIFFEUR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
