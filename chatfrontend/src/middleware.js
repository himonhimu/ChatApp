import { NextResponse } from "next/server";

export function middleware(req) {
  const path = req.nextUrl.pathname;
  const isLoginPage = path === "/login" || path.startsWith("/login/");
  const isSignUpPage = path === "/sign-up" || path.startsWith("/sign-up/");

  // Get the `mcookie` value
  let mcookie = req.cookies.get("chat-user");

  // Treat undefined or invalid cookies as false
  if (!mcookie || mcookie === "undefined") {
    mcookie = false;
  }

  // If `mcookie` exists and the user is on the login or sign-up page, redirect to home
  if ((isLoginPage || isSignUpPage) && mcookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access to login or sign-up pages if there's no `mcookie`
  if (!mcookie && (isLoginPage || isSignUpPage)) {
    return NextResponse.next();
  }

  // Redirect to the login page if no `mcookie` and accessing restricted routes
  if (!mcookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow the request to continue if none of the above conditions are met
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)", // Match all pages except static assets or APIs
  ],
};
