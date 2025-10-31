"use client";

import { useEffect, useState } from 'react';
import ArticleList from './ArticleList';
import ArticleForm from './ArticleForm';
import Dashboard from './Dashboard';
import BannersManager from './BannersManager';
import UsersManager from './UsersManager';
import VideosManager from './VideosManager';
import mockArticles from '../../data/mockArticles';

export default function AdminShell() {
  // Defer reading localStorage until after hydration to avoid SSR/client HTML mismatch
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [selected, setSelected] = useState<any | null>(null);
  const [tab, setTab] = useState<'articles'|'dashboard'|'banners'|'users'|'videos'>('articles');
  const [savingStatus, setSavingStatus] = useState<'idle'|'saving'|'saved-server'|'saved-local'|'error'>('idle');

  // On mount, load persisted state from localStorage
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('admin:user');
      const rawArticles = localStorage.getItem('admin:articles');
      if (rawUser) setUser(JSON.parse(rawUser));
      if (rawArticles) setArticles(JSON.parse(rawArticles));
    } catch (e) {
      // ignore parse errors and fall back to defaults
    }
    setHydrated(true);
  }, []);

  // Persist after hydration only
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('admin:articles', JSON.stringify(articles));
      // dispatch a custom event so other components on the page can react immediately
      try {
        window.dispatchEvent(new CustomEvent('admin:articles:changed', { detail: articles }));
      } catch (e) {
        // ignore
      }
    } catch (e) {}
  }, [articles, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('admin:user', JSON.stringify(user)); } catch (e) {}
  }, [user, hydrated]);

  // After hydration, try to load authoritative articles from the server and merge
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        const r = await fetch('/api/articles');
        if (!r.ok) return;
        const serverArticles = await r.json();
        if (!Array.isArray(serverArticles)) return;

        setArticles((local) => {
          // keep locally-unsynced items (synced === false) and prepend server articles
          const localUnsynced = (local || []).filter((a: any) => a.synced === false || a.synced === undefined);
          // remove duplicates by slug: prefer server version
          const merged = [...serverArticles, ...localUnsynced];
          const seen = new Set();
          return merged.filter((it: any) => {
            if (!it || !it.slug) return false;
            if (seen.has(it.slug)) return false;
            seen.add(it.slug);
            return true;
          });
        });
        console.log('Admin: merged server articles into local state', serverArticles.length);
      } catch (e) {
        console.error('Admin: failed to fetch server articles', e);
      }
    })();
  }, [hydrated]);

  const login = (username: string, role: string) => setUser({ username, role });
  const logout = () => setUser(null);

  const upsert = (article: any) => {
    // Try to persist server-side, but fall back to local state if server not available
    (async () => {
      setSavingStatus('saving');
      try {
        const r = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(article),
        });
        if (r.ok) {
          const created = await r.json();
          setArticles(prev => {
            const exists = prev.find((p: any) => p.slug === created.slug);
            if (exists) return prev.map((p: any) => p.slug === created.slug ? { ...p, ...created } : p);
            return [{ ...created, author: { name: user?.username || 'Admin' } }, ...prev];
          });
          setSavingStatus('saved-server');
        } else {
          throw new Error('server returned non-ok');
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
          const r = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(art),
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

  const forceServerResync = async () => {
    try {
      const raw = localStorage.getItem('admin:articles');
      if (!raw) { alert('Aucun article local à resynchroniser'); return; }
      const arr = JSON.parse(raw || '[]');
      if (!Array.isArray(arr) || arr.length === 0) { alert('Aucun article local à resynchroniser'); return; }
      const r = await fetch('/api/debug/resync-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arr),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        console.error('Force resync failed', j);
        alert('Resync failed, see console');
        return;
      }
      const j = await r.json();
      if (j && Array.isArray(j.all)) {
        setArticles(j.all);
        localStorage.setItem('admin:articles', JSON.stringify(j.all));
        window.dispatchEvent(new CustomEvent('admin:articles:changed', { detail: j.all }));
        alert('Resync terminé: ' + (j.results ? j.results.length : 0) + ' articles traités');
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
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.slug !== slug));
      } else {
        console.error('Failed to delete article on server');
      }
    } catch (e) {
      console.error('Error while deleting article:', e);
    }
  };

  const toggleBreaking = (slug: string) => {
    setArticles(prev => prev.map(a => a.slug === slug ? { ...a, isBreaking: !a.isBreaking } : a));
  };

  // While waiting for hydration, render a simple placeholder that's identical between
  // server and client to avoid hydration mismatch. After hydration completes we show
  // the login form or admin shell depending on auth state.
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Chargement…</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Connexion Admin (prototype)</h2>
          <LoginForm onLogin={login} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {tab === 'articles' && <ArticleList articles={articles} onDelete={remove} onEdit={(a) => setSelected(a)} onToggleBreaking={toggleBreaking} />}
            {tab === 'dashboard' && <Dashboard articles={articles} />}
            {tab === 'banners' && <BannersManager />}
            {tab === 'users' && <UsersManager />}
            {tab === 'videos' && <VideosManager />}
          </div>
          <div>
            {tab === 'articles' && <ArticleForm onSave={upsert} initial={selected} onCancel={() => setSelected(null)} />}
            {tab === 'dashboard' && <div className="p-4 text-sm text-gray-500">Statistiques en temps réel (mock)</div>}
            {tab === 'banners' && <div className="p-4 text-sm text-gray-500">Prévisualisation des bannières</div>}
            {tab === 'users' && <div className="p-4 text-sm text-gray-500">Gestion des comptes</div>}
            {tab === 'videos' && <div className="p-4 text-sm text-gray-500">Gestion des vidéos (IDs)</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (u: string, r: string) => void }) {
  const [username, setUsername] = useState('admin');
  const [role, setRole] = useState('admin');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onLogin(username, role); }}>
      <label className="block text-sm mb-1">Nom d'utilisateur</label>
      <input className="w-full mb-2 p-2 rounded" value={username} onChange={(e) => setUsername(e.target.value)} />
      <label className="block text-sm mb-1">Rôle</label>
      <select className="w-full mb-4 p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="writer">Rédacteur</option>
        <option value="editor">Éditeur</option>
        <option value="admin">Admin</option>
      </select>
      <button className="w-full bg-blue-600 text-white py-2 rounded">Se connecter</button>
    </form>
  );
}
