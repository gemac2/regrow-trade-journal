"use client";
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';

import { authClient } from './lib/auth';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#080B11] text-slate-100 antialiased selection:bg-[#00E599]/30 selection:text-white min-h-screen">
        <NeonAuthUIProvider authClient={authClient}>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}