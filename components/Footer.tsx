"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'sent'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      // Use the top-level API route which is always available: /api/newsletter
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),

      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        // If API returned a message, show it to the user if present
        // eslint-disable-next-line no-console
        console.warn('[newsletter] failed:', payload);
        setErrorMsg(payload?.error || 'Une erreur est survenue');
        setStatus('error');
          setToast({ type: 'error', title: 'Erreur', message: payload?.error || 'Une erreur est survenue lors de l&apos;inscription.' });
        return;
      }
      setStatus('sent');
      setEmail('');
  setToast({ type: 'success', title: 'Abonnement confirmé', message: 'Merci ! Vous &ecirc;tes inscrit &agrave; la newsletter.' });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Impossible de contacter le serveur.');
      setToast({ type: 'error', title: 'Erreur', message: 'Impossible de contacter le serveur.' });
    }
  }

  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start text-left">
          {/* Column 1: Branding & description (left aligned) */}
          <div className="space-y-3">
              <a href="/actualite" className="inline-flex items-center gap-3 mb-1">
              <span className="text-3xl md:text-4xl font-bold">Les As de la presse</span>
            </a>
            <p className="text-gray-400 text-sm leading-6">Votre source d&apos;information en République Démocratique du Congo. Journalisme indépendant, enquêtes et analyses.</p>
            
          </div>

          {/* Column 2: Rubriques */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">Rubriques</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/actualite" className="hover:text-white hover:underline">Actualité</Link></li>
              <li><Link href="/actualite/politique" className="hover:text-white hover:underline">Politique</Link></li>
              <li><Link href="/actualite/securite" className="hover:text-white hover:underline">Sécurité</Link></li>
              <li><Link href="/actualite/economie" className="hover:text-white hover:underline">Économie</Link></li>
              <li><Link href="/actualite/societe" className="hover:text-white hover:underline">Société</Link></li>
              <li><Link href="/actualite/culture" className="hover:text-white hover:underline">Culture</Link></li>
              <li><Link href="/actualite/sport" className="hover:text-white hover:underline">Sport</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-3">Recevez chaque matin le résumé des principales actualités.</p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row sm:items-center items-start">
              <label htmlFor="newsletter" className="text-sm font-medium text-gray-200 sr-only">Adresse email</label>
              <div className="flex items-center">
                <input
                  id="newsletter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Votre email"
                  required
                  className="w-full sm:w-32 px-3 py-2 rounded-l-md text-gray-900 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="-ml-px inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  disabled={status === 'loading' || status === 'sent'}
                  aria-label="S&apos;abonner"
                >
                  {status === 'sent' ? (
                    'Merci !'
                  ) : status === 'loading' ? (
                    'Envoi…'
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span>S&apos;abonner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {status === 'error' && <p className="text-sm text-red-400 mt-2">{errorMsg ?? 'Une erreur est survenue. Réessayez plus tard.'}</p>}
          </div>

          {/* Column 4: Contact & Ressources */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Contact</h3>
              <address className="not-italic text-gray-400 text-sm">
                Email: <a href="mailto:contact@asdelapresse.cd" className="hover:text-white">contact@asdelapresse.cd</a><br />
                Tél: +243820282857
              </address>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">Ressources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/actualite/privacy" className="hover:text-white hover:underline">Politique de confidentialité</Link></li>
                <li><Link href="/actualite/privacy#terms" className="hover:text-white hover:underline">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/actualite/privacy#cookies" className="hover:text-white hover:underline">Cookies</Link></li>
              </ul>
          </div>
        </div>

        {/* Social icons row */}
        <div className="mt-10">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
            <p className="text-sm uppercase tracking-wide text-gray-400">Suivez-nous</p>
            <div className="flex items-center justify-center gap-10">
            <a 
              href="https://web.facebook.com/profile.php?id=61577858264984" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook" 
              className="social-icon social-icon-facebook text-white"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="X (Twitter)" 
              className="social-icon social-icon-twitter text-white"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3h3.9l5.2 6.9L18.2 3H21l-7.5 9.4L21 21h-3.9l-5.4-7.2L5.8 21H3l7.9-9.9L3 3z" />
              </svg>
            </a>
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram" 
              className="social-icon social-icon-instagram text-white"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.325 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.325-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.325-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.325C8.416 2.175 8.796 2.163 12 2.163zm0 1.684c-3.153 0-3.523.012-4.762.069-1.022.047-1.578.218-1.946.363-.49.19-.84.417-1.208.785-.368.368-.595.718-.785 1.208-.145.368-.316.924-.363 1.946-.057 1.239-.069 1.609-.069 4.762s.012 3.523.069 4.762c.047 1.022.218 1.578.363 1.946.19.49.417.84.785 1.208.368.368.718.595 1.208.785.368.145.924.316 1.946.363 1.239.057 1.609.069 4.762.069s3.523-.012 4.762-.069c1.022-.047 1.578-.218 1.946-.363.49-.19.84-.417 1.208-.785.368-.368.595-.718.785-1.208.145-.368.316-.924.363-1.946.057-1.239.069-1.609.069-4.762s-.012-3.523-.069-4.762c-.047-1.022-.218-1.578-.363-1.946-.19-.49-.417-.84-.785-1.208-.368-.368-.718-.595-1.208-.785-.368-.145-.924-.316-1.946-.363-1.239-.057-1.609-.069-4.762-.069zm0 3.789a5.364 5.364 0 110 10.728 5.364 5.364 0 010-10.728zm0 1.684a3.68 3.68 0 100 7.36 3.68 3.68 0 000-7.36zm5.884-2.232a1.252 1.252 0 110 2.504 1.252 1.252 0 010-2.504z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn" 
              className="social-icon social-icon-linkedin text-white"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.983 3.5C4.983 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.483 1.12 2.483 2.5zM0 8.25h5V23H0V8.25zM8.75 8.25h4.788v2.006h.068c.667-1.263 2.296-2.594 4.727-2.594 5.055 0 5.987 3.33 5.987 7.66V23h-5v-6.5c0-1.55-.028-3.54-2.156-3.54-2.158 0-2.488 1.685-2.488 3.425V23h-4.926V8.25z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@lesasdelapresse7865" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="YouTube" 
              className="social-icon social-icon-youtube text-white"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a2.999 2.999 0 00-2.117-2.117C19.73 3.5 12 3.5 12 3.5s-7.73 0-9.381.569A2.999 2.999 0 00.5 6.186 31.78 31.78 0 000 12a31.78 31.78 0 00.5 5.814 2.999 2.999 0 002.119 2.117C4.27 20.5 12 20.5 12 20.5s7.73 0 9.381-.569a2.999 2.999 0 002.117-2.117A31.78 31.78 0 0024 12a31.78 31.78 0 00-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
              </svg>
            </a>
            </div>
          </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="text-gray-400 text-sm text-center md:text-left space-y-1">
              <p>© {year} Les As de la presse — Tous droits réservés.</p>
            </div>
            <p className="text-gray-400 text-sm">Conception & développement © <a href="#" className="hover:text-white underline">HermesX</a></p>
          </div>
        </div>
      </div>

      {/* Toast / popup */}
      {/** aria-live region for accessibility **/}
      <div aria-live="polite" className="fixed z-50 bottom-6 right-6">
        {/* Render simple toast when present */}
        {toast && (
          <div className={`max-w-sm w-full bg-white text-gray-900 rounded-md shadow-lg p-3 border ${toast.type === 'success' ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium">{toast.title}</div>
                <div className="text-xs text-gray-600">{toast.message}</div>
              </div>
              <div className="ml-auto pl-2">
                <button onClick={() => setToast(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
