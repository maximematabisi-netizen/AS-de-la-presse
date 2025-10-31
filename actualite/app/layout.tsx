import './globals.css';
import Navbar from './components/Navbar';
import NewsTicker from './components/NewsTicker';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <NewsTicker />
      <main>
        {children}
      </main>
    </div>
  );
}