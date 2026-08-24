import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth checks live in each page/route that accesses protected data
// (e.g. app/article/[id]/page.tsx calls auth().protect() directly) rather
// than here, per Clerk's resource-based auth guidance — path-matching-based
// middleware protection (createRouteMatcher + auth.protect() in proxy.ts)
// is deprecated. This file only establishes Clerk's auth context.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|ingest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
