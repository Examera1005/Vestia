import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resizeImageFile } from '../lib/utils';
import { Upload, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { user, profile, createProfile, logOut } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('unisex');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If somehow they get here but aren't logged in, redirect will be handled by PrivateRoute?
  // Actually Onboarding is public in router right now, let's redirect if no user.
  if (!user && !loading) {
    navigate('/');
    return null;
  }
  
  if (profile) {
    navigate('/dashboard');
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

  const handleSubmit = async () => {
    if (!photo) return alert("Please upload a picture of yourself.");
    setLoading(true);
    try {
      await createProfile({ gender, basePhotoBase64: photo });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-serif mb-2">Create Identity</h2>
          <p className="text-sm font-semibold tracking-wider text-black/50 uppercase">Step 1 of 1</p>
        </div>

        <div className="mb-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-black/60">Category Preference</p>
          <div className="flex gap-2">
            {(['women', 'men', 'unisex'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 px-4 border text-xs uppercase font-bold tracking-wider rounded-xl transition-colors ${gender === g ? 'border-black bg-black text-[#f5f2ed]' : 'border-black/10 hover:border-black/30'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-black/60">Your Silhouette</p>
          <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${photo ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {photo ? (
              <div className="flex flex-col items-center gap-4">
                 <img src={photo} alt="Base" className="h-48 w-auto rounded-lg object-contain" />
                 <span className="text-xs font-bold tracking-widest border-b border-black">Change Image</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-6 w-6 opacity-40 mb-2" />
                <span className="text-sm font-medium">Upload a full-body photo</span>
                <span className="text-xs text-black/40">Well-lit, neutral background preferred.</span>
              </div>
            )}
          </label>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={logOut}
            className="flex-1 py-4 border border-black/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!photo || loading}
            className="flex-[2] flex items-center justify-center gap-2 bg-black text-[#f5f2ed] border border-black rounded-full py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Finish Setup'}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
