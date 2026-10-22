import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const authed = Boolean(req.auth);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  if (pathname === "/checkout" && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
