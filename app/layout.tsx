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
    <html lang="es">
      <body className="bg-slate-950 text-white">
        <NeonAuthUIProvider authClient={authClient}>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}