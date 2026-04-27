import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Galery from './Gallery';
import TryOnStudio from './TryOnStudio';
import { LogOut, Shirt, LayoutGrid, Home, Camera, ArrowRight, UserRound } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/dashboard/studio', label: 'Try-On Studio', icon: Shirt },
  { to: '/dashboard/gallery', label: 'My Collection', icon: LayoutGrid },
];

function DashboardHome() {
  const { profile } = useAuth();
  const hasPhoto = Boolean(profile?.basePhotoBase64);

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-12">
      <header className="mb-10 flex flex-col justify-between gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-black/40">Dashboard</p>
          <h2 className="text-5xl font-light leading-none">
            Bonjour,
            <span className="block font-serif italic text-stone-500">{profile?.username || 'there'}.</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white">
            {hasPhoto ? (
              <img src={profile?.basePhotoBase64 || ''} alt="Profile" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserRound className="h-5 w-5 text-black/35" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold capitalize">{profile?.gender}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">
              {hasPhoto ? 'Studio ready' : 'Photo needed'}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/dashboard/studio" className="group border border-black/10 bg-white/55 p-6 transition-colors hover:border-black/30">
          <div className="mb-10 flex items-center justify-between">
            <Shirt className="h-5 w-5 text-black/50" />
            <ArrowRight className="h-4 w-4 text-black/35 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-2 text-2xl font-serif">Try-On Studio</h3>
          <p className="text-sm leading-6 text-black/50">Extract garments and project them on your silhouette.</p>
        </Link>

        <Link to="/dashboard/gallery" className="group border border-black/10 bg-white/55 p-6 transition-colors hover:border-black/30">
          <div className="mb-10 flex items-center justify-between">
            <LayoutGrid className="h-5 w-5 text-black/50" />
            <ArrowRight className="h-4 w-4 text-black/35 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-2 text-2xl font-serif">Collection</h3>
          <p className="text-sm leading-6 text-black/50">Browse every saved look from your private archive.</p>
        </Link>

        <Link to="/onboarding" className="group border border-black/10 bg-[#1a1a1a] p-6 text-[#f5f2ed] transition-colors hover:bg-black">
          <div className="mb-10 flex items-center justify-between">
            <Camera className="h-5 w-5 text-[#f5f2ed]/70" />
            <ArrowRight className="h-4 w-4 text-[#f5f2ed]/50 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-2 text-2xl font-serif">{hasPhoto ? 'Update silhouette' : 'Add silhouette'}</h3>
          <p className="text-sm leading-6 text-[#f5f2ed]/55">
            {hasPhoto ? 'Refresh your base photo when your fitting setup changes.' : 'Upload a full-body photo to activate the AI fitting flow.'}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, logOut } = useAuth();
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar / Topnav */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black/10 bg-[#f5f2ed] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="mb-12">
            <h1 className="text-2xl font-serif">Vestia</h1>
            <p className="text-[10px] tracking-widest uppercase font-bold text-black/40 mt-1">Studio</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link 
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-colors ${activePath === to ? 'bg-black text-[#f5f2ed]' : 'hover:bg-black/5'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-3 px-4">
            {profile?.basePhotoBase64 ? (
              <img src={profile.basePhotoBase64} alt="Profile" className="h-10 w-10 rounded-full object-cover border border-black/10" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white">
                <UserRound className="h-4 w-4 text-black/35" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold">{profile?.username}</p>
              <p className="text-[10px] text-black/50 uppercase tracking-widest">Connected</p>
            </div>
          </div>
          <button 
            onClick={logOut}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors px-4"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="flex md:hidden items-center justify-between p-4 border-b border-black/10">
         <h1 className="text-xl font-serif">Vestia</h1>
         <div className="flex gap-3">
            <Link to="/dashboard" className="text-[10px] uppercase tracking-widest font-bold">Home</Link>
            <Link to="/dashboard/studio" className="text-[10px] uppercase tracking-widest font-bold">Studio</Link>
            <Link to="/dashboard/gallery" className="text-[10px] uppercase tracking-widest font-bold">Gallery</Link>
         </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="studio" element={<TryOnStudio />} />
          <Route path="gallery" element={<Galery />} />
        </Routes>
      </main>
    </div>
  );
}
