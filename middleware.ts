import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definimos cuáles rutas son PROTEGIDAS (Privadas)
// Todo lo que NO esté aquí, será público (como la Landing Page '/')
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protege /dashboard y subrutas
  '/trades(.*)',    // Protege /trades y subrutas
  '/api(.*)',       // Protege tu API
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Si la ruta es protegida, obligamos a iniciar sesión
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};