import { useEffect, useRef } from 'react';
import type { Prize } from '@/types';
import { X, Trophy } from 'lucide-react';

interface ResultModalProps {
  prize: Prize;
  onClose: () => void;
}

interface Confetti {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  angle: number;
  va: number;
}

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF69B4', '#7B68EE', '#FFA500'];

export default function ResultModal({ prize, onClose }: ResultModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 初始化彩带粒子
    confettiRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.angle += c.va;
        c.vy += 0.05;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 彩带画布 */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* 毛玻璃遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 结果卡片 */}
      <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(255,215,0,0.2)] animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
            <Trophy className="text-yellow-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">恭喜中奖！</h2>
          <div
            className="inline-block px-6 py-3 rounded-xl text-xl font-bold mt-2 mb-6"
            style={{ backgroundColor: prize.color + '30', color: prize.color }}
          >
            {prize.name}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all active:scale-[0.98]"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
