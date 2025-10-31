"use client";

export default function Dashboard({ articles }: { articles: any[] }) {
  const total = articles.length;
  const byCategory = articles.reduce((acc: any, a: any) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  const authors = articles.reduce((acc: any, a: any) => {
    const name = a.author?.name || 'Anonyme';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topAuthors = Object.entries(authors).sort((a: any, b: any) => b[1] - a[1]).slice(0,5);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Tableau de bord</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="text-sm text-gray-500">Articles publiés</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="text-sm text-gray-500">Catégories</div>
          <ul className="mt-2 text-sm">
            {Object.entries(byCategory).map(([k,v]) => (
              <li key={k}>{k}: {String(v)}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="text-sm text-gray-500">Auteurs (top)</div>
          <ul className="mt-2 text-sm">
            {topAuthors.map(([name,count]: any) => (
              <li key={name}>{name}: {String(count)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
