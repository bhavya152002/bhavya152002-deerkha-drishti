import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token');
    const { pathname } = request.nextUrl;

    // 1. If user is on login page and HAS token -> Redirect to Dashboard
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. If user is NOT on login page AND trying to access protected routes (dashboard/camera) AND matches protection logic
    // Protected paths: '/' (dashboard) and '/camera/*'
    const isProtectedPath = pathname === '/' || pathname.startsWith('/camera');

    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Admin protection
    if (pathname === '/admin' && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
