import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Login pagina is altijd toegankelijk
  if (pathname === "/admin/inloggen") {
    // Redirect ingelogde gebruikers naar dashboard
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Alle andere /admin routes vereisen authenticatie
  if (!req.auth) {
    return NextResponse.redirect(new URL("/admin/inloggen", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
