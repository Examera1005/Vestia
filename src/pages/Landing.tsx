import { useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, MoveRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Landing() {
  const { user, profile, loading, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile) navigate('/dashboard');
      else navigate('/onboarding');
    }
  }, [user, profile, loading, navigate]);

  // 3D Parallax effect for mouse movement
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] relative overflow-hidden flex flex-col font-sans"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-stone-300/40 to-stone-200/40 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#e5dfd5]/60 to-[#dcd3c6]/60 blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-3xl font-serif tracking-tight"
        >
          Vestia.
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 md:gap-8"
        >
          <button 
            onClick={signIn} 
            disabled={loading}
            className="text-xs uppercase tracking-widest font-bold text-black/60 hover:text-black transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={signIn}
            disabled={loading}
            className="group relative overflow-hidden rounded-full bg-black px-6 py-3 text-xs uppercase tracking-widest font-bold text-[#f5f2ed] transition-transform hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Sign Up <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-stone-700 to-black opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </motion.div>
      </nav>

      {/* Body / Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 max-w-7xl mx-auto w-full gap-12 lg:gap-0">
        
        {/* Left Typography */}
        <div className="flex-1 flex flex-col justify-center items-start pt-12 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/30 backdrop-blur-md px-4 py-1.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase"
          >
            <Sparkles className="h-3 w-3" />
            <span>The AI Fitting Room</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tighter leading-[0.95] mb-8">
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Redefine your
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block font-serif italic text-stone-500"
            >
              silhouette.
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-black/60 max-w-md font-medium leading-relaxed mb-10"
          >
            Extract garments from any photo and seamlessly project them onto your own body. Create your digital wardrobe, powered by intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <button 
              onClick={signIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-black text-[#f5f2ed] rounded-full px-8 py-5 text-sm uppercase tracking-widest font-bold shadow-2xl hover:shadow-black/20 hover:bg-stone-900 transition-all hover:scale-105 active:scale-95"
            >
              {loading ? 'Initializing...' : 'Enter Studio'}
              <MoveRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-4">
              Men &middot; Women &middot; Unisex
            </p>
          </motion.div>
        </div>

        {/* Right 3D Visual Composition */}
        <div className="flex-1 w-full h-[50vh] lg:h-auto flex items-center justify-center relative perspective-[1200px]">
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-full max-w-[400px] aspect-[3/4]"
          >
            {/* Glass Card 1 - Back */}
            <motion.div
              initial={{ opacity: 0, z: -100, rotate: -10 }}
              animate={{ opacity: 1, z: -50, rotate: -5 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ translateZ: "-50px" }}
              className="absolute inset-0 bg-stone-200/50 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl translate-x-12 translate-y-8"
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </motion.div>

            {/* Glass Card 2 - Main Foreground */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ translateZ: "50px" }}
              className="absolute inset-0 bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-4 flex flex-col"
            >
               {/* Abstract Fashion Image Placeholder Array */}
               <div className="flex-1 bg-stone-100 rounded-xl overflow-hidden relative shadow-inner">
                  {/* Subtle abstract lines simulating a garment/silhouette */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-x-8 top-12 bottom-24 border border-black/10 rounded-[100px] bg-gradient-to-b from-stone-200 to-transparent"
                  />
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-x-16 top-1/3 bottom-12 border border-black/15 rounded-[100px] bg-black/5"
                  />
                  
                  {/* Interface elements inside the card */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <div className="h-10 w-10 bg-white shadow-sm rounded-lg border border-black/5 backdrop-blur-md flex items-center justify-center">
                       <div className="w-4 h-4 rounded-full border-2 border-black/20" />
                    </div>
                    <div className="h-10 flex-1 bg-white shadow-sm rounded-lg border border-black/5 backdrop-blur-md flex items-center px-4">
                       <div className="h-1.5 w-1/2 bg-black/10 rounded-full" />
                    </div>
                  </div>
               </div>
            </motion.div>

            {/* Floating element - Tag */}
            <motion.div
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
               style={{ translateZ: "100px" }}
               className="absolute -right-6 top-24 bg-black text-[#f5f2ed] py-2 px-4 rounded-full shadow-2xl flex items-center gap-2"
            >
               <Sparkles className="w-3 h-3 text-[#f5f2ed]/70" />
               <span className="text-[10px] font-bold uppercase tracking-widest">AI Generated</span>
            </motion.div>

          </motion.div>
        </div>

      </main>
    </div>
  );
}
