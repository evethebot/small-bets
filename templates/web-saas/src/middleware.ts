export { auth as middleware } from "@/lib/auth";

export const config = {
  // Match all routes except static files and API auth
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
