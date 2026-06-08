import { useRef, useEffect, useCallback } from 'react';
import { useLotteryStore } from '@/store/lotteryStore';
import type { Prize } from '@/types';

interface WheelProps {
  rotation: number;
  onSpinEnd: () => void;
}

const WHEEL_SIZE = 440;
const BULB_COUNT = 24;

export default function Wheel({ rotation, onSpinEnd }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prizes = useLotteryStore((s) => s.prizes);
  const isSpinning = useLotteryStore((s) => s.isSpinning);
  const prevSpinningRef = useRef(false);
  const bulbPhaseRef = useRef(0);
  const animFrameRef = useRef(0);

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, bulbPhase: number) => {
      const dpr = window.devicePixelRatio || 1;
      const size = WHEEL_SIZE;
      const center = size / 2;
      const outerRadius = center - 20;
      const innerRadius = outerRadius - 12;

      ctx.clearRect(0, 0, size * dpr, size * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      // 外圈底色
      ctx.beginPath();
      ctx.arc(center, center, outerRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#8B0000';
      ctx.fill();

      // 灯泡
      for (let i = 0; i < BULB_COUNT; i++) {
        const angle = (i / BULB_COUNT) * Math.PI * 2 - Math.PI / 2;
        const bx = center + (outerRadius + 2) * Math.cos(angle);
        const by = center + (outerRadius + 2) * Math.sin(angle);
        const isLit = (i + bulbPhase) % 2 === 0;

        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = isLit ? '#FFD700' : '#8B6914';
        ctx.fill();
        if (isLit) {
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 内圈边框
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 扇形分区
      const sliceAngle = (Math.PI * 2) / prizes.length;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((rotation * Math.PI) / 180);

      prizes.forEach((prize: Prize, i: number) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // 扇形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, innerRadius - 4, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 文字
        ctx.save();
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
        const textRadius = innerRadius * 0.62;
        ctx.fillText(prize.name, textRadius, 0);
        ctx.restore();
      });

      ctx.restore();

      // 中心圆
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, 32);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#B8860B');
      ctx.beginPath();
      ctx.arc(center, center, 32, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 中心文字
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 13px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GO', center, center);

      // 指针（顶部三角形）
      ctx.beginPath();
      ctx.moveTo(center, center - innerRadius + 10);
      ctx.lineTo(center - 14, center - innerRadius - 22);
      ctx.lineTo(center + 14, center - innerRadius - 22);
      ctx.closePath();
      ctx.fillStyle = '#FF2D2D';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    },
    [prizes, rotation],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    canvas.style.width = `${WHEEL_SIZE}px`;
    canvas.style.height = `${WHEEL_SIZE}px`;

    let lastBulbSwitch = 0;

    const animate = (time: number) => {
      if (time - lastBulbSwitch > 500) {
        bulbPhaseRef.current = (bulbPhaseRef.current + 1) % 2;
        lastBulbSwitch = time;
      }
      drawWheel(ctx, bulbPhaseRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawWheel]);

  // 检测旋转结束
  useEffect(() => {
    if (prevSpinningRef.current && !isSpinning) {
      onSpinEnd();
    }
    prevSpinningRef.current = isSpinning;
  }, [isSpinning, onSpinEnd]);

  return (
    <div className="relative inline-block">
      <canvas ref={canvasRef} className="drop-shadow-2xl" />
    </div>
  );
}
