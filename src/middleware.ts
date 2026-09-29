import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = [
  "/dashboard",
  "/events",
  "/tasks",
  "/budget",
  "/guests",
  "/vendors",
  "/invitations",
  "/gallery",
  "/website",
  "/settings",
  "/create-wedding",
  "/weddings",
]

const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value

  const isAuthenticated = !!sessionToken

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|w/|rsvp/|gallery/|invite/).*)",
  ],
}
