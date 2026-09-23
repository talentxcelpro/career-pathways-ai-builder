import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Coins, Zap } from 'lucide-react';
import txcMascot from '@/assets/txc-mascot.jpg';

interface TXC3DAnimatedMascotProps {
  size?: number;
  showOrbitCoins?: boolean;
  className?: string;
}

export const TXC3DAnimatedMascot: React.FC<TXC3DAnimatedMascotProps> = ({
  size = 130,
  showOrbitCoins = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Mouse tilt physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['18deg', '-18deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-22deg', '22deg']);
  const shineOpacity = useTransform(mouseXSpring, [-0.5, 0.5], [0.1, 0.45]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setClickCount((c) => c + 1);
    setTimeout(() => setIsFlipping(false), 900);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{
        perspective: '1200px',
        width: size + 60,
        height: size + 60,
      }}
    >
      {/* 3D Holographic Orbit Ring Behind Mascot */}
      <motion.div
        animate={{
          rotate: 360,
          scale: isHovered ? [1, 1.06, 1] : 1,
        }}
        transition={{
          rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute inset-2 rounded-full pointer-events-none"
        style={{
          border: '2px dashed rgba(245, 158, 11, 0.45)',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 72%)',
          filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.4))',
          transform: 'rotateX(65deg) scale(1.15)',
        }}
      />

      {/* Orbiting 3D Gold Coins */}
      {showOrbitCoins && (
        <>
          {/* Orbit Coin 1 */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              style={{ transform: `translate(${size * 0.65}px, 0) rotate(-45deg)` }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border border-yellow-100 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.8)]"
            >
              <span className="text-[10px] font-black text-amber-950">TXC</span>
            </motion.div>
          </motion.div>

          {/* Orbit Coin 2 (Opposite direction & phase) */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              style={{ transform: `translate(-${size * 0.62}px, 0) rotate(45deg)` }}
              animate={{ rotateY: -360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 border border-yellow-200 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.7)]"
            >
              <Coins className="w-3.5 h-3.5 text-amber-900" />
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Main 3D Floating Coin & Mascot Body */}
      <motion.div
        style={{
          width: size,
          height: size,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={
          isFlipping
            ? {
                rotateY: [0, 360],
                scale: [1, 1.15, 1],
                y: [0, -20, 0],
              }
            : {
                y: [0, -8, 0],
                rotateZ: [0, 1.5, 0, -1.5, 0],
              }
        }
        transition={
          isFlipping
            ? { duration: 0.85, ease: 'easeInOut' }
            : {
                y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
                rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              }
        }
        className="relative rounded-full flex items-center justify-center cursor-pointer"
      >
        {/* Multi-layered 3D Coin Bevel Rings */}
        {/* Layer 1: Outer glowing halo */}
        <div
          className="absolute -inset-3 rounded-full blur-xl opacity-60 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 pointer-events-none"
          style={{ transform: 'translateZ(-20px)' }}
        />

        {/* Layer 2: 3D Coin Base / Outer Metallic Rim */}
        <div
          className="absolute -inset-1.5 rounded-full p-[3px] bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#78350f] shadow-[0_15px_35px_-5px_rgba(217,119,6,0.5),0_0_20px_rgba(251,191,36,0.4)]"
          style={{ transform: 'translateZ(-5px)' }}
        />

        {/* Layer 3: Inner Inset Bevel */}
        <div
          className="absolute -inset-0.5 rounded-full p-[2px] bg-gradient-to-tr from-[#fbbf24] via-[#ffffff] to-[#d97706]"
          style={{ transform: 'translateZ(5px)' }}
        />

        {/* Layer 4: Doge Mascot Image with 3D Depth */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden border-2 border-amber-300 shadow-inner bg-slate-900"
          style={{ transform: 'translateZ(15px)' }}
        >
          <img
            src={txcMascot}
            alt="TXC Mining Mascot"
            className="w-full h-full object-cover rounded-full"
            style={{
              filter: 'contrast(1.05) brightness(1.03)',
            }}
          />

          {/* Dynamic 3D Specular Light Sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              opacity: shineOpacity,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, transparent 60%)',
            }}
          />

          {/* Continuous Gleam Pulse */}
          <motion.div
            animate={{
              x: ['-120%', '200%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-25 pointer-events-none"
          />
        </div>

        {/* Floating 3D "EARN" Badge */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-2 -right-2 z-30"
          style={{
            transform: 'translateZ(38px)',
          }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.7)] border border-blue-300/40 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
            <span>EARN</span>
          </div>
        </motion.div>

        {/* Floating 3D "+10 TXC" Reward on Click */}
        {clickCount > 0 && (
          <motion.div
            key={clickCount}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -45, scale: 1.25 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-40 whitespace-nowrap"
            style={{ transform: 'translateZ(50px)' }}
          >
            <span className="bg-amber-400 text-amber-950 font-black text-xs px-2 py-0.5 rounded-full shadow-lg border border-yellow-100 flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-900 fill-amber-900" />
              +10 TXC!
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TXC3DAnimatedMascot;
