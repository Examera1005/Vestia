import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { extractClothing } from '../lib/gemini';
import { resizeImageFile, resizeBase64Image, makeWhiteTransparent } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Upload, Sparkles, Wand2, Image as ImageIcon, Save, Download, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

interface WardrobeItem {
  id: string;
  category: 'top' | 'bottom' | 'fullbody';
  imageBase64: string;
  createdAt: string;
}

export default function TryOnStudio() {
  const { user, profile } = useAuth();
  
  // Extract state
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [extractingCategory, setExtractingCategory] = useState<'top' | 'bottom'>('top');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Wardrobe state
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [isFetchingWardrobe, setIsFetchingWardrobe] = useState(true);

  // Studio state
  const [activeTop, setActiveTop] = useState<WardrobeItem | null>(null);
  const [activeBottom, setActiveBottom] = useState<WardrobeItem | null>(null);
  const [isSavingOutfit, setIsSavingOutfit] = useState(false);
  const outfitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWardrobe();
  }, [user]);

  const fetchWardrobe = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'wardrobeItems'), where('userId', '==', user.uid));
      const snaps = await getDocs(q);
      const items = snaps.docs.map(d => ({ id: d.id, ...d.data() })) as WardrobeItem[];
      items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWardrobe(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingWardrobe(false);
    }
  };

  const handleClothingUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageFile(file, 800, 800);
      setClothingPhoto(base64);
      setExtractionError(null);
    } catch (err) {
      console.error(err);
      setExtractionError('Failed to process image');
    }
  };

  const handleExtract = async () => {
    if (!clothingPhoto || !profile?.basePhotoBase64 || !user) return;
    setIsExtracting(true);
    setExtractionError(null);
    try {
      // 1. AI Extract & reshape to fit base photo pose
      const rawExtracted = await extractClothing(profile.basePhotoBase64, clothingPhoto, extractingCategory);
      // 2. Make white background transparent
      const transparentImage = await makeWhiteTransparent(rawExtracted, 230);
      // 3. Compress slightly
      const compressedResult = await resizeBase64Image(transparentImage, 800, 1000);

      // Save to Firebase
      const itemId = crypto.randomUUID();
      const newItem: WardrobeItem = {
        id: itemId,
        userId: user.uid,
        category: extractingCategory,
        imageBase64: compressedResult,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'wardrobeItems', itemId), newItem);
      
      // Update local state
      setWardrobe(prev => [newItem, ...prev]);
      setClothingPhoto(null);
      
    } catch (e: any) {
      console.error(e);
      setExtractionError(e.message || 'Extraction failed. Try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'wardrobeItems', id));
      setWardrobe(prev => prev.filter(i => i.id !== id));
      if (activeTop?.id === id) setActiveTop(null);
      if (activeBottom?.id === id) setActiveBottom(null);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSaveOutfit = async () => {
    if (!user || (!activeTop && !activeBottom) || !outfitRef.current) return;
    setIsSavingOutfit(true);
    try {
      const canvas = await html2canvas(outfitRef.current, { useCORS: true, backgroundColor: null });
      const combinedImage = canvas.toDataURL('image/jpeg', 0.8);
      const compressed = await resizeBase64Image(combinedImage, 800, 1000);

      const outfitId = crypto.randomUUID();
      await setDoc(doc(db, 'outfits', outfitId), {
        userId: user.uid,
        resultImageBase64: compressed,
        createdAt: new Date().toISOString()
      });
      alert('Outfit saved to gallery!');
    } catch (e) {
      console.error(e);
      alert('Failed to save outfit');
    } finally {
      setIsSavingOutfit(false);
    }
  };

  const handleDownloadOutfit = async () => {
    if (!outfitRef.current) return;
    try {
      const canvas = await html2canvas(outfitRef.current, { useCORS: true, backgroundColor: null });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `vestia-outfit-${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-serif mb-2">Wardrobe & Studio</h2>
        <p className="text-sm font-semibold tracking-wide text-black/50">Extract items and combine them on your silhouette.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left Column - Tools & Wardrobe */}
        <div className="space-y-12">
           
           {/* Extractor */}
           <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">Item Extractor</h3>
             </div>
             
             <div className="flex gap-4">
                <label className="flex-1 border-2 border-dashed border-black/20 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors aspect-[4/3] cursor-pointer relative group overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={handleClothingUpload} />
                    {clothingPhoto ? (
                      <img src={clothingPhoto} alt="Upload" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                         <Upload className="h-6 w-6 opacity-40 mb-2" />
                         <span className="text-xs text-black/60 uppercase tracking-widest font-bold">Select Photo</span>
                      </div>
                    )}
                </label>
                
                <div className="flex-1 flex flex-col gap-3">
                   <div className="flex gap-2">
                     {(['top', 'bottom'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setExtractingCategory(cat)}
                          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest border rounded hover:bg-black/5 ${extractingCategory === cat ? 'border-black text-black' : 'border-black/20 text-black/40'}`}
                        >
                          {cat}
                        </button>
                     ))}
                   </div>
                   
                   <button 
                      onClick={handleExtract}
                      disabled={!clothingPhoto || isExtracting}
                      className="flex-1 flex items-center justify-center gap-2 bg-black text-[#f5f2ed] rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors hover:bg-black/90 disabled:opacity-50"
                   >
                      <Sparkles className="h-3 w-3" />
                      {isExtracting ? 'Extracting...' : 'Extract & Normalize'}
                   </button>
                   {extractionError && <p className="text-[10px] text-red-500 font-bold uppercase">{extractionError}</p>}
                </div>
             </div>
           </div>

           {/* Wardrobe Items */}
           <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">My Items</h3>
             </div>
             
             {isFetchingWardrobe ? (
                <p className="text-xs uppercase font-bold text-black/40">Loading wardrobe...</p>
             ) : wardrobe.length === 0 ? (
                <p className="text-xs uppercase font-bold text-black/40">No items extracted yet.</p>
             ) : (
                <div className="grid grid-cols-4 gap-3">
                   {wardrobe.map(item => {
                     const isActive = activeTop?.id === item.id || activeBottom?.id === item.id;
                     return (
                       <button
                         key={item.id}
                         onClick={() => {
                           if (item.category === 'top') {
                             setActiveTop(isActive ? null : item);
                           } else {
                             setActiveBottom(isActive ? null : item);
                           }
                         }}
                         className={`relative rounded-xl border p-1 aspect-square bg-white transition-all overflow-hidden group ${isActive ? 'border-black shadow-md ring-1 ring-black' : 'border-black/10 hover:border-black/30'}`}
                       >
                          <img src={item.imageBase64} className="w-full h-full object-contain mix-blend-multiply" alt="item" />
                          <div 
                            onClick={(e) => handleDeleteItem(e, item.id)}
                            className="absolute top-1 right-1 h-5 w-5 bg-black/10 hover:bg-red-500/80 hover:text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-black/50"
                          >
                            <X className="h-3 w-3" />
                          </div>
                          {isActive && <div className="absolute inset-0 border-2 border-black rounded-xl pointer-events-none" />}
                       </button>
                     );
                   })}
                </div>
             )}
           </div>
        </div>

        {/* Right Column - Canvas Studio */}
        <div className="flex flex-col">
           <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-black/60">Live Projection</span>
              <div className="flex gap-2">
                 <button onClick={handleDownloadOutfit} className="p-2 border border-black/10 rounded-lg hover:bg-black/5 text-black/60 hover:text-black transition-colors" title="Download">
                    <Download className="h-4 w-4" />
                 </button>
                 <button onClick={handleSaveOutfit} disabled={isSavingOutfit || (!activeTop && !activeBottom)} className="p-2 flex items-center gap-2 border border-black/10 rounded-lg bg-black text-[#f5f2ed] hover:bg-black/90 disabled:opacity-50 transition-colors">
                    <Save className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Save Outfit</span>
                 </button>
              </div>
           </div>
           
           <div className="flex-1 bg-white border border-black/10 rounded-2xl p-4 overflow-hidden shadow-inner flex items-center justify-center">
              <div ref={outfitRef} className="relative w-full max-w-[400px] aspect-[3/4] bg-[#f5f2ed] rounded-xl overflow-hidden shadow-sm">
                 {/* Base Layer */}
                 {profile?.basePhotoBase64 && (
                   <img src={profile.basePhotoBase64} alt="Silhouette" className="absolute inset-0 w-full h-full object-cover z-0" />
                 )}
                 
                 {/* Clothing Layers (Draggable to allow fine-tuning if needed) */}
                 {activeBottom && (
                   <motion.img 
                     src={activeBottom.imageBase64} 
                     alt="Bottom" 
                     drag dragConstraints={outfitRef} dragElastic={0}
                     className="absolute inset-0 w-full h-full object-contain cursor-move z-10 drop-shadow-xl" 
                   />
                 )}
                 
                 {activeTop && (
                   <motion.img 
                     src={activeTop.imageBase64} 
                     alt="Top" 
                     drag dragConstraints={outfitRef} dragElastic={0}
                     className="absolute inset-0 w-full h-full object-contain cursor-move z-20 drop-shadow-xl" 
                   />
                 )}
                 
                 {!activeTop && !activeBottom && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center flex-col pointer-events-none text-black/40">
                      <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-xs uppercase tracking-widest font-bold">Select items to project</p>
                    </div>
                 )}
              </div>
           </div>
           <p className="text-[10px] text-center mt-3 text-black/40 font-bold uppercase tracking-widest">
             Drag items to fine-tune placement over your silhouette.
           </p>
        </div>
      </div>
    </div>
  );
}
