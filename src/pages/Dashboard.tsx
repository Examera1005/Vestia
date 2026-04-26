import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Galery from './Gallery';
import TryOnStudio from './TryOnStudio';
import { LogOut, Shirt, LayoutGrid } from 'lucide-react';

export default function Dashboard() {
  const { profile, logOut } = useAuth();
  const location = useLocation();

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
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors ${location.pathname === '/dashboard' ? 'bg-black text-[#f5f2ed]' : 'hover:bg-black/5'}`}
            >
              <Shirt className="h-4 w-4" />
              Try-On Studio
            </Link>
            <Link 
              to="/dashboard/gallery" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors ${location.pathname === '/dashboard/gallery' ? 'bg-black text-[#f5f2ed]' : 'hover:bg-black/5'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              My Collection
            </Link>
          </nav>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-3 px-4">
            {profile?.basePhotoBase64 && (
              <img src={profile.basePhotoBase64} alt="Profile" className="h-10 w-10 rounded-full object-cover border border-black/10" />
            )}
            <div>
              <p className="text-xs font-bold capitalize">{profile?.gender}</p>
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
         <div className="flex gap-4">
            <Link to="/dashboard" className="text-xs uppercase tracking-widest font-bold">Studio</Link>
            <Link to="/dashboard/gallery" className="text-xs uppercase tracking-widest font-bold">Gallery</Link>
         </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<TryOnStudio />} />
          <Route path="gallery" element={<Galery />} />
        </Routes>
      </main>
    </div>
  );
}
