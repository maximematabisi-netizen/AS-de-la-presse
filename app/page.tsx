import { redirect } from 'next/navigation';

// Redirect root to the actualite app home
export default function Page() {
  redirect('/actualite');
}
