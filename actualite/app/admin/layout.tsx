export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout spécifique pour admin sans header/footer
  return <>{children}</>;
}

