import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
  "/",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without auth
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Allow Next.js internal routes and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(webp|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|pdf)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:webp|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|pdf)$).*)",
  ],
};
