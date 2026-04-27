import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resizeImageFile } from '../lib/utils';
import { Upload, ArrowRight, Camera, UserRound, Sparkles, X } from 'lucide-react';

export default function Onboarding() {
  const { user, profile, loading: authLoading, createProfile, updateProfile, logOut } = useAuth();
  const navigate = useNavigate();
  const suggestedUsername = user?.displayName?.split(' ')[0] || '';
  const [username, setUsername] = useState(suggestedUsername);
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('unisex');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUsername(profile?.username || user.displayName?.split(' ')[0] || '');
    setGender(profile?.gender || 'unisex');
    setPhoto(profile?.basePhotoBase64 || null);
  }, [user, profile]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-widest text-black/50">Loading...</span>
      </div>
    );
  }

  if (!user && !loading) {
    navigate('/');
    return null;
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageFile(file, 800, 1000);
      setPhoto(base64);
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2) return alert("Please choose a username.");
    setLoading(true);
    try {
      const profileData = { username: cleanUsername, gender, basePhotoBase64: photo };
      if (profile) await updateProfile(profileData);
      else await createProfile(profileData);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] px-6 py-8 text-[#1a1a1a]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Vestia.</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-black/40">Account Atelier</p>
          </div>
          <button
            onClick={logOut}
            className="rounded-full border border-black/10 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/50 transition-colors hover:border-black/30 hover:text-black"
          >
            Sign out
          </button>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              {profile ? 'Profile settings' : 'New profile'}
            </div>
            <h2 className="text-5xl font-light leading-none sm:text-6xl">
              {profile ? 'Refine your' : 'Create your'}
              <span className="block font-serif italic text-stone-500">Vestia account.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm font-medium leading-7 text-black/55">
              Choose a username and style preference. Add a silhouette photo whenever you are ready to unlock the fitting studio.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="border border-black/10 bg-white/55 p-5 shadow-sm backdrop-blur md:p-8">
            <div className="mb-8 flex items-start justify-between gap-6 border-b border-black/10 pb-6">
              <div>
                <h3 className="text-3xl font-serif">Identity</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-black/40">Step 1 of 1</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-[#f5f2ed]">
                <UserRound className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-7 space-y-3">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-black/60">Username</label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={24}
                placeholder="Choose your name"
                className="w-full border border-black/10 bg-[#f5f2ed]/60 px-4 py-4 text-sm font-semibold outline-none transition-colors placeholder:text-black/25 focus:border-black"
              />
            </div>

            <div className="mb-7 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-black/60">Style Preference</p>
              <div className="grid grid-cols-3 gap-2">
                {(['women', 'men', 'unisex'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 px-3 border text-[10px] uppercase font-bold tracking-widest transition-colors ${gender === g ? 'border-black bg-black text-[#f5f2ed]' : 'border-black/10 hover:border-black/30'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/60">Silhouette Photo</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/35">Optional</span>
              </div>
              <label className={`block border border-dashed p-5 text-center cursor-pointer transition-colors ${photo ? 'border-black bg-[#f5f2ed]/60' : 'border-black/20 hover:border-black/40'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {photo ? (
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:text-left">
                    <img src={photo} alt="Base" className="mx-auto h-36 w-28 object-cover sm:mx-0" />
                    <div className="flex flex-col justify-center gap-3">
                      <Camera className="h-5 w-5 opacity-40" />
                      <span className="text-sm font-semibold">Silhouette added</span>
                      <span className="text-xs leading-6 text-black/45">You can change it before entering the dashboard.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Upload className="h-6 w-6 opacity-40" />
                    <span className="text-sm font-semibold">Upload a full-body photo</span>
                    <span className="max-w-xs text-xs leading-6 text-black/40">The studio needs this later, but you can finish your account first.</span>
                  </div>
                )}
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 transition-colors hover:text-black"
                >
                  <X className="h-3 w-3" />
                  Remove photo
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={logOut}
                className="flex-1 border border-black/10 py-4 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={username.trim().length < 2 || loading}
                className="flex-[2] flex items-center justify-center gap-2 bg-black text-[#f5f2ed] border border-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : profile ? 'Save Profile' : 'Enter Dashboard'}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
