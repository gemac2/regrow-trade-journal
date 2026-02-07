// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Simplemente redirigimos al dashboard.
  // El layout de (main) o el middleware se encargarán de verificar si estás logueado.
  redirect('/dashboard');
}