import { useState, ChangeEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateTryOn } from '../lib/gemini';
import { resizeImageFile, resizeBase64Image } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Upload, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';

export default function TryOnStudio() {
  const { user, profile } = useAuth();
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClothingUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageFile(file, 800, 800);
      setClothingPhoto(base64);
      setResult(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to process image');
    }
  };

  const handleGenerate = async () => {
    if (!clothingPhoto || !profile?.basePhotoBase64 || !user) return;
    setLoading(true);
    setError(null);
    try {
      const resultBase64 = await generateTryOn(profile.basePhotoBase64, clothingPhoto);
      // Reduce size so it fits nicely in Firestore limits
      const compressedResult = await resizeBase64Image(resultBase64, 800, 1000);
      setResult(compressedResult);

      // Save to Firebase
      const tryOnId = crypto.randomUUID();
      await setDoc(doc(db, 'tryOns', tryOnId), {
        userId: user.uid,
        clothingImageBase64: clothingPhoto,
        resultImageBase64: compressedResult,
        createdAt: new Date().toISOString()
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-serif mb-2">The Studio</h2>
        <p className="text-sm font-semibold tracking-wide text-black/50">Upload a clothing item to see how it fits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column - Input */}
        <div className="space-y-8">
           <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-black/60">Your Silhouette</span>
             </div>
             <div className="border border-black/10 p-2 rounded-2xl bg-white shadow-sm overflow-hidden aspect-[3/4]">
                <img src={profile?.basePhotoBase64} alt="Silhouette" className="w-full h-full object-cover rounded-xl" />
             </div>
           </div>

           <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-black/60">Target Clothing</span>
             </div>
             <label className="block border-2 border-dashed border-black/20 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors aspect-[3/4] cursor-pointer relative group overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={handleClothingUpload} />
                {clothingPhoto ? (
                  <img src={clothingPhoto} alt="Clothing" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                     <Upload className="h-8 w-8 opacity-40 mb-3" />
                     <span className="font-serif text-xl mb-1">Select Item</span>
                     <span className="text-xs text-black/50 uppercase tracking-widest font-bold">Image Upload</span>
                  </div>
                )}
             </label>
           </div>
        </div>

        {/* Right Column - Output */}
        <div className="flex flex-col">
           <div className="flex items-center justify-between mb-3 h-[18px]">
              <span className="text-xs font-bold uppercase tracking-widest text-black/60">Result</span>
           </div>
           
           <div className="flex-1 border border-black/10 rounded-2xl bg-white shadow-sm overflow-hidden relative min-h-[400px] flex items-center justify-center p-2 isolate aspect-[3/4] md:aspect-auto">
              {!result && !loading && (
                <div className="text-center p-8 z-10">
                   <ImageIcon className="h-10 w-10 opacity-20 mx-auto mb-4" />
                   <p className="font-serif text-2xl text-black/40">Projection Area</p>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                   <Sparkles className="h-8 w-8 animate-pulse mb-4 text-[#FF4444]" />
                   <span className="text-xs font-bold uppercase tracking-widest">Weaving Fabric...</span>
                </div>
              )}

              {result && (
                <img src={result} alt="Try On Result" className="w-full h-full object-cover rounded-xl z-0" />
              )}
           </div>

           <div className="mt-8">
              {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 text-center">{error}</p>}
              <button 
                onClick={handleGenerate}
                disabled={!clothingPhoto || loading}
                className="w-full flex items-center justify-center gap-3 bg-black text-[#f5f2ed] rounded-full py-4 uppercase tracking-widest font-bold text-xs disabled:opacity-50 transition-colors hover:bg-black/90"
              >
                <Wand2 className="h-4 w-4" />
                {loading ? 'Generating...' : 'Project Outfit'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
