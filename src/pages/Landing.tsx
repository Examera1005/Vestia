import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { user, profile, loading, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile) navigate('/dashboard');
      else navigate('/onboarding');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 10%, #d4c8b8 0%, transparent 50%)' }}></div>
      
      <div className="z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Vestia V1.0</span>
        </div>
        
        <h1 className="mb-6 text-6xl md:text-8xl font-light tracking-tight leading-[0.9]">
          Vestia
          <br />
          <span className="font-serif italic text-[#6a5e4d]">AI Try-On</span>
        </h1>
        
        <p className="mb-10 text-black/60 max-w-md font-medium">
          A personalized virtual fitting room. Superimpose the world’s fashion onto your own silhouette.
        </p>

        <button 
          onClick={signIn}
          disabled={loading}
          className="group flex items-center gap-2 rounded-full border border-black/20 bg-transparent px-8 py-4 font-semibold tracking-widest uppercase text-xs transition-all hover:bg-black hover:text-[#f5f2ed] disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Enter Vestia'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <p className="absolute bottom-6 text-xs text-black/40 uppercase tracking-widest font-semibold flex gap-6">
        <span>Men</span>
        <span>&middot;</span>
        <span>Women</span>
        <span>&middot;</span>
        <span>Unisex</span>
      </p>
    </div>
  );
}
