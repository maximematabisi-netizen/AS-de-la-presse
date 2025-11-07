"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleList from './ArticleList';
import ArticleForm from './ArticleForm';
import Dashboard from './Dashboard';
import BannersManager from './BannersManager';
import UsersManager from './UsersManager';
import VideosManager from './VideosManager';
import GalleryManager from './GalleryManager';
import mockArticles from '../../data/mockArticles';

interface User {
  userId: number;
  username: string;
  role: string;
}

export default function AdminShell() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [selected, setSelected] = useState<any | null>(null);
  const [tab, setTab] = useState<'articles'|'dashboard'|'banners'|'users'|'videos'|'gallery'>('articles');
  const [savingStatus, setSavingStatus] = useState<'idle'|'saving'|'saved-server'|'saved-local'|'error'>('idle');
  const [homepageLimit, setHomepageLimit] = useState<number | null>(null);

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/actualite/admin/login');
          return;
        }
      } catch (err) {
        router.push('/actualite/admin/login');
        return;
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };
    checkSession();
  }, [router]);

  // Persist articles after hydration (pour le fallback uniquement)
  // Le serveur reste la source de vérité - localStorage est juste un cache
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('admin:articles', JSON.stringify(articles));
      try {
        window.dispatchEvent(new CustomEvent('admin:articles:changed', { detail: articles }));
      } catch (e) {
        // ignore
      }
    } catch (e) {}
  }, [articles, hydrated]);

  // After hydration, try to load authoritative articles from the server
  // Le serveur est la source de vérité - les articles supprimés ne seront plus dans la liste
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const r = await fetch('/api/articles', { cache: 'no-store' });
        if (!r.ok) return;
        const serverArticles = await r.json();
        if (!Array.isArray(serverArticles)) return;

        // Merge server articles with any locally-saved articles (preserve unsynced local items)
        const localRaw = localStorage.getItem('admin:articles');
        let localArticles: any[] = [];
        try {
          localArticles = localRaw ? JSON.parse(localRaw) : [];
        } catch (e) {
          localArticles = [];
        }

        const mappedServer = serverArticles.map((a: any) => ({ ...a, author: { name: user?.username || 'Admin' }, synced: true }));

        // Find local items that are not present on server (by slug) and preserve them
        const missingLocal = Array.isArray(localArticles)
          ? localArticles.filter((l: any) => !mappedServer.some((s: any) => String(s.slug) === String(l.slug)))
          : [];

        // Keep order: server items first (source of truth), then preserved local unsynced
        const merged = [...mappedServer, ...missingLocal.map((l: any) => ({ ...l, author: { name: user?.username || 'Admin' }, synced: false }))];

        // De-duplicate just in case
        const seen = new Set();
        const deduped = [] as any[];
        for (const a of merged) {
          const key = String(a.slug || a.id || JSON.stringify(a));
          if (!seen.has(key)) { seen.add(key); deduped.push(a); }
        }

        setArticles(deduped);
        localStorage.setItem('admin:articles', JSON.stringify(deduped));
        console.log('Admin: loaded and merged server + local articles', deduped.length);
      } catch (e) {
        console.error('Admin: failed to fetch server articles', e);
      }
    })();
    // Fetch homepage limit for admin info banner
    (async () => {
      try {
        const r = await fetch('/api/debug/homepage-limit', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (j && typeof j.limit === 'number') setHomepageLimit(j.limit);
      } catch (e) {
        // ignore
      }
    })();
  }, [hydrated, user]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    router.push('/actualite/admin/login');
  };

  const upsert = (article: any) => {
    // Try to persist server-side, but fall back to local state if server not available
    (async () => {
      setSavingStatus('saving');
      try {
        // sanitize payload: only send primitive/string fields the server expects
        const sanitize = (a: any) => ({
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          category: a.category,
          publishedAt: a.publishedAt || null,
          // only send image if it's a string (URL or path)
          image: typeof a.image === 'string' ? a.image : null,
          highlightedQuote: a.highlightedQuote || null,
          authorName: a.authorName || null,
          isBreaking: !!a.isBreaking,
        });

        const r = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitize(article)),
        });
        if (r.ok) {
          const created = await r.json();
          console.log('Article created on server:', created);
          
          // Ajouter l'article à la liste locale
          setArticles(prev => {
            const exists = prev.find((p: any) => p.slug === created.slug);
            if (exists) {
              return prev.map((p: any) => p.slug === created.slug ? { ...p, ...created, synced: true } : p);
            }
            return [{ ...created, author: { name: user?.username || 'Admin' }, synced: true }, ...prev];
          });
          
          setSavingStatus('saved-server');
          
          // Recharger la liste complète depuis le serveur après un court délai
          setTimeout(async () => {
            try {
              const refreshRes = await fetch('/api/articles');
              if (refreshRes.ok) {
                const serverArticles = await refreshRes.json();
                if (Array.isArray(serverArticles)) {
                  setArticles(serverArticles.map((a: any) => ({
                    ...a,
                    author: { name: user?.username || 'Admin' },
                    synced: true
                  })));
                  console.log('Articles list refreshed from server:', serverArticles.length);
                }
              }
            } catch (e) {
              console.error('Failed to refresh articles list:', e);
            }
          }, 500);
        } else {
          const errorData = await r.json().catch(() => ({}));
          console.error('Server returned error:', r.status, errorData);
          throw new Error(errorData.error || 'server returned non-ok');
        }
      } catch (e) {
        // fallback to local-only
        setArticles(prev => {
          const exists = prev.find((p: any) => p.slug === article.slug);
          if (exists) return prev.map((p: any) => p.slug === article.slug ? { ...p, ...article } : p);
          return [{ ...article, id: Date.now(), author: { name: user?.username || 'Admin' }, synced: false, syncedAt: null }, ...prev];
        });
        setSavingStatus('saved-local');
      } finally {
        setSelected(null);
        // reset status to idle after a short delay so UI isn't permanently set
        setTimeout(() => setSavingStatus('idle'), 2500);
      }
    })();
  };

  // Try to resync any locally-saved articles (synced: false) to the server
  const resyncUnsynced = async () => {
    setSavingStatus('saving');
    const unsynced = articles.filter(a => a.synced === false || a.synced === undefined);
    try {
        for (const art of unsynced) {
        try {
          const sanitize = (a: any) => ({
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            content: a.content,
            category: a.category,
            publishedAt: a.publishedAt || null,
            image: typeof a.image === 'string' ? a.image : null,
            highlightedQuote: a.highlightedQuote || null,
            authorName: a.authorName || null,
            isBreaking: !!a.isBreaking,
          });

          const r = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitize(art)),
          });
          if (r.ok) {
            const created = await r.json();
            setArticles(prev => prev.map(p => p.slug === art.slug ? { ...p, ...created } : p));
          }
        } catch (e) {
          // continue trying others
        }
      }
      setSavingStatus('saved-server');
    } catch (e) {
      setSavingStatus('error');
    } finally {
      setTimeout(() => setSavingStatus('idle'), 2500);
    }
  };

  // Background auto-resync: periodically try to resend any unsynced local articles.
  // This ensures that if the first POST failed (network/edge), the client will
  // automatically retry and once the server accepts, the server-side revalidation
  // will make the article appear on the homepage without manual steps.
  useEffect(() => {
    if (!hydrated) return;
    let stopped = false;
    const interval = setInterval(async () => {
      if (stopped) return;
      try {
        const unsynced = articles.filter(a => a.synced === false || a.synced === undefined);
        if (!unsynced || unsynced.length === 0) return;
        console.log('Auto-resync: found', unsynced.length, 'unsynced articles, attempting resync...');
        await resyncUnsynced();
      } catch (e) {
        // ignore transient errors - we'll retry on next tick
        console.warn('Auto-resync attempt failed (will retry):', e);
      }
    }, 8000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [hydrated, articles]);

  const forceServerResync = async () => {
    try {
      const raw = localStorage.getItem('admin:articles');
      if (!raw) { alert('Aucun article local à resynchroniser'); return; }
      const arr = JSON.parse(raw || '[]');
      if (!Array.isArray(arr) || arr.length === 0) { alert('Aucun article local à resynchroniser'); return; }
      // Try bulk resync first and show detailed errors if any
      const r = await fetch('/api/debug/resync-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arr),
      });
      if (!r.ok) {
        let msg = 'unknown error';
        try {
          const j = await r.json();
          console.error('Force resync failed', j);
          msg = j?.error || JSON.stringify(j);
        } catch (e) {
          const t = await r.text();
          console.error('Force resync failed (text)', t);
          msg = t;
        }
        alert('Resync failed: ' + msg);
        return;
      }
      const j = await r.json();
      // If the bulk resync reported item-level failures, try per-item POST as a fallback
      const failedItems = Array.isArray(j.results) ? j.results.filter((it: any) => !it.ok) : [];
      if (failedItems.length > 0) {
        // attempt individual upserts via /api/articles for failing items
        const fallbackResults: any[] = [];
          for (const fi of failedItems) {
          const orig = arr.find((a: any) => {
            const slug = (a && a.slug) || '';
            return String(slug) === String(fi.slug);
          }) || null;
          if (!orig) { fallbackResults.push({ slug: fi.slug, ok: false, error: 'original payload not found' }); continue; }
          try {
            const sanitize = (a: any) => ({
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              content: a.content,
              category: a.category,
              publishedAt: a.publishedAt || null,
              image: typeof a.image === 'string' ? a.image : null,
              highlightedQuote: a.highlightedQuote || null,
              authorName: a.authorName || null,
              isBreaking: !!a.isBreaking,
            });

            const r2 = await fetch('/api/articles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sanitize(orig)),
            });
            if (r2.ok) {
              const created = await r2.json();
              fallbackResults.push({ slug: fi.slug, ok: true, id: created.id });
            } else {
              let errMsg = '';
              try { const je = await r2.json(); errMsg = je?.error || JSON.stringify(je); } catch (_) { errMsg = await r2.text().catch(() => 'unknown'); }
              fallbackResults.push({ slug: fi.slug, ok: false, error: errMsg });
            }
          } catch (e) {
            fallbackResults.push({ slug: fi.slug, ok: false, error: e instanceof Error ? e.message : String(e) });
          }
        }
        // Merge fallback results into j.results for reporting
        const mergedResults = j.results.map((rItem: any) => {
          const fb = fallbackResults.find((f: any) => String(f.slug) === String(rItem.slug));
          return fb ? { ...rItem, fallback: fb } : rItem;
        });
        j.results = mergedResults;
      }
      if (j && Array.isArray(j.all)) {
        const serverArticles = j.all as any[];
        // Preserve any local-only articles that were not created on the server during resync
        const localArr = Array.isArray(arr) ? arr : [];
        const missingLocal = localArr.filter((l: any) => !serverArticles.some(s => String(s.slug) === String(l.slug)));

        const mappedServer = serverArticles.map((a: any) => ({ ...a, author: { name: user?.username || 'Admin' }, synced: true }));
        const preservedLocal = missingLocal.map((l: any) => ({ ...l, author: { name: user?.username || 'Admin' }, synced: false }));

        const merged = [...mappedServer, ...preservedLocal];

        setArticles(merged);
        localStorage.setItem('admin:articles', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('admin:articles:changed', { detail: merged }));

        // Prepare a friendly result summary
    const total = j.results ? j.results.length : 0;
  const failedItemsAfter = Array.isArray(j.results) ? j.results.filter((r: any) => !r.ok) : [];
  const failed = failedItemsAfter.map((r: any) => `${r.slug}${r.error ? `: ${r.error}` : ''}${r.fallback ? ` (fallback: ${r.fallback.ok ? 'ok' : r.fallback.error})` : ''}`);
  alert('Resync terminé: ' + total + ' articles traités' + (failed.length ? '\nÉchecs:\n' + failed.join('\n') : ''));
      } else {
        alert('Resync terminé (aucun détail)');
      }
    } catch (e) {
      console.error('Force resync error', e);
      alert('Erreur lors du resync, voyez la console');
    }
  };

  const remove = async (slug: string) => {
    try {
      // If article is only local (not synced), remove it locally and from localStorage only
      const found = articles.find(a => a.slug === slug);
      if (found && (found.synced === false || found.synced === undefined)) {
        const newList = articles.filter(a => a.slug !== slug);
        setArticles(newList);
        try { localStorage.setItem('admin:articles', JSON.stringify(newList)); } catch (e) {}
        alert('Article local supprimé.');
        return;
      }

      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Retirer l'article de la liste locale immédiatement (use a computed new list to avoid stale state)
        const newList = articles.filter(a => a.slug !== slug);
        setArticles(newList);
        try { localStorage.setItem('admin:articles', JSON.stringify(newList)); } catch (e) {}

        // Rafraîchir la liste complète depuis le serveur après un court délai
        setTimeout(async () => {
          try {
            const refreshRes = await fetch('/api/articles');
            if (refreshRes.ok) {
              const serverArticles = await refreshRes.json();
              if (Array.isArray(serverArticles)) {
                setArticles(serverArticles.map((a: any) => ({
                  ...a,
                  author: { name: user?.username || 'Admin' },
                  synced: true
                })));
                console.log('Articles list refreshed after deletion:', serverArticles.length);
              }
            }
          } catch (e) {
            console.error('Failed to refresh articles list after deletion:', e);
          }
        }, 300);
      } else {
        let errorMsg = 'Erreur inconnue';
        try {
          const errorData = await res.json();
          errorMsg = errorData?.error || JSON.stringify(errorData);
        } catch (e) {
          try { const text = await res.text(); if (text) errorMsg = text; } catch (_) {}
        }
        console.error('Failed to delete article on server:', res.status, errorMsg);
        alert(`Erreur lors de la suppression: ${errorMsg}`);
      }
    } catch (e) {
      console.error('Error while deleting article:', e);
      alert('Erreur lors de la suppression de l\'article');
    }
  };

  const toggleBreaking = (slug: string) => {
    setArticles(prev => prev.map(a => a.slug === slug ? { ...a, isBreaking: !a.isBreaking } : a));
  };

  // While waiting for authentication check, show loading
  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Chargement…</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Admin banner: show homepage limit and quick actions */}
      {homepageLimit !== null && (
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900 flex items-center justify-between">
            <div>
              La page d'accueil affiche actuellement jusqu'à <strong>{homepageLimit}</strong> articles par défaut.
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => window.open('/actualite?all=true', '_blank')} className="px-3 py-1 bg-yellow-100 text-yellow-900 rounded text-sm">Voir la page complète</button>
              <a target="_blank" rel="noreferrer" href="https://vercel.com/docs/environment-variables" className="px-3 py-1 bg-white text-yellow-900 rounded text-sm">Modifier (Vercel)</a>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <div className="flex items-center gap-3">
              <div className="text-sm">{user.username} • {user.role}</div>
              <div>
                {savingStatus === 'saving' && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Enregistrement…</span>}
                {savingStatus === 'saved-server' && <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Sauvé sur serveur</span>}
                {savingStatus === 'saved-local' && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Sauvé localement</span>}
                {savingStatus === 'error' && <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Erreur</span>}
              </div>
              <button onClick={resyncUnsynced} className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Resync unsynced</button>
              <button onClick={forceServerResync} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Forcer resync serveur</button>
            <button onClick={logout} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">Déconnexion</button>
          </div>
        </div>

        <div className="mb-4">
          <nav className="flex gap-3">
            <button className={`px-3 py-1 rounded ${tab==='articles'?'bg-blue-600 text-white':''}`} onClick={() => setTab('articles')}>Articles</button>
            <button className={`px-3 py-1 rounded ${tab==='dashboard'?'bg-blue-600 text-white':''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
            <button className={`px-3 py-1 rounded ${tab==='banners'?'bg-blue-600 text-white':''}`} onClick={() => setTab('banners')}>Bannières</button>
            <button className={`px-3 py-1 rounded ${tab==='users'?'bg-blue-600 text-white':''}`} onClick={() => setTab('users')}>Utilisateurs</button>
            <button className={`px-3 py-1 rounded ${tab==='videos'?'bg-blue-600 text-white':''}`} onClick={() => setTab('videos')}>Vidéos</button>
            <button className={`px-3 py-1 rounded ${tab==='gallery'?'bg-blue-600 text-white':''}`} onClick={() => setTab('gallery')}>Galerie</button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {tab === 'articles' && <ArticleList articles={articles} onDelete={remove} onEdit={(a) => setSelected(a)} onToggleBreaking={toggleBreaking} />}
            {tab === 'dashboard' && <Dashboard articles={articles} />}
            {tab === 'banners' && <BannersManager />}
            {tab === 'users' && <UsersManager />}
            {tab === 'videos' && <VideosManager />}
            {tab === 'gallery' && <GalleryManager />}
          </div>
          <div>
            {tab === 'articles' && <ArticleForm onSave={upsert} initial={selected} onCancel={() => setSelected(null)} />}
            {tab === 'dashboard' && <div className="p-4 text-sm text-gray-500">Statistiques en temps réel (mock)</div>}
            {tab === 'banners' && <div className="p-4 text-sm text-gray-500">Prévisualisation des bannières</div>}
            {tab === 'users' && <div className="p-4 text-sm text-gray-500">Gestion des comptes</div>}
            {tab === 'videos' && <div className="p-4 text-sm text-gray-500">Gestion des vidéos (IDs)</div>}
            {tab === 'gallery' && <div className="p-4 text-sm text-gray-500">Ajouter/supprimer des photos pour la galerie</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

