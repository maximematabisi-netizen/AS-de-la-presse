import { redirect } from 'next/navigation';

export default function AdminRedirectPage() {
  // Redirect root /admin to the actualite admin prototype
  redirect('/actualite/admin');
}
