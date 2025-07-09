import { betterFetch } from '@better-fetch/fetch';
import {
  authRoutes,
  DEFAULT_AUTH_ROUTE,
  protectedRoutes,
  publicRoutes,
} from '@repo/auth/routes';
import { type NextRequest, NextResponse } from 'next/server';
import type { auth } from '~/auth/server';

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const _isPublicRoute = publicRoutes.includes(pathname);

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get session for protected routes and auth routes
  if (isProtectedRoute || isAuthRoute) {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get('cookie') || '', // Forward the cookies from the request
        },
      }
    );

    // If user is not authenticated and trying to access protected route
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }

    // If user is authenticated and trying to access auth route, redirect to home
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
