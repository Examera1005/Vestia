import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Download } from 'lucide-react';

interface TryOnRecord {
  id: string;
  clothingImageBase64: string;
  resultImageBase64: string;
  createdAt: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const [items, setItems] = useState<TryOnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchGallery = async () => {
      try {
        const q = query(
          collection(db, 'outfits'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          // Outfits have only resultImageBase64 now
          clothingImageBase64: '',
          ...doc.data()
        })) as TryOnRecord[];
        
        fetchedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(fetchedItems);
      } catch (err: any) {
        console.error("Firebase error", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [user]);

  if (loading) {
    return <div className="p-12 text-center text-xs uppercase tracking-widest font-bold text-black/50">Loading Collection...</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-serif mb-2">My Collection</h2>
        <p className="text-sm font-semibold tracking-wide text-black/50">Your personal archive of constructed looks.</p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-black/10 rounded-3xl bg-white shadow-sm">
          <p className="font-serif text-2xl text-black/40 mb-2">The wardrobe is empty</p>
          <p className="text-xs font-bold uppercase tracking-widest text-black/30">Generate try-ons to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-black/10 aspect-[3/4]">
               <img src={item.resultImageBase64} alt="Outcome" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-end translate-y-4 group-hover:translate-y-0 transition-transform">
                     <a href={item.resultImageBase64} download={`vestia-outfit-${item.id}.jpg`} className="h-10 w-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl">
                        <Download className="h-4 w-4" />
                     </a>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
