"use client";

import { useEffect, useState } from 'react';

const DEFAULT_USERS = [
  { id: 1, username: 'alice', role: 'admin' },
  { id: 2, username: 'bob', role: 'editor' },
  { id: 3, username: 'carol', role: 'writer' },
];

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('admin:users');
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch (e) { return DEFAULT_USERS; }
  });

  useEffect(() => {
    try { localStorage.setItem('admin:users', JSON.stringify(users)); } catch (e) {}
  }, [users]);

  const setRole = (id: number, role: string) => setUsers((prev: any[]) => prev.map((u: any) => u.id === id ? { ...u, role } : u));

  const addUser = (username: string, role: string) => {
    setUsers(prev => {
      const id = prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1;
      return [{ id, username, role }, ...prev];
    });
  };

  const [newUser, setNewUser] = useState('');
  const [newRole, setNewRole] = useState('writer');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Utilisateurs</h3>
      <div className="space-y-2">
        <div className="p-2 border rounded mb-3">
          <div className="text-sm font-medium mb-2">Ajouter un rédacteur</div>
          <div className="flex gap-2">
            <input className="p-2 rounded border flex-1" placeholder="Nom d'utilisateur" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="p-2 rounded">
              <option value="writer">Rédacteur</option>
              <option value="editor">Éditeur</option>
              <option value="admin">Admin</option>
            </select>
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => { if (!newUser.trim()) return; addUser(newUser.trim(), newRole); setNewUser(''); setNewRole('writer'); }}>Ajouter</button>
          </div>
        </div>
        {users.map((u: any) => (
          <div key={u.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-medium">{u.username}</div>
              <div className="text-sm text-gray-500">Rôle actuel: {u.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="p-1 rounded">
                <option value="writer">Rédacteur</option>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
