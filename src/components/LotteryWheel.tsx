import { useState, useCallback, useRef } from 'react';
import { useLotteryStore } from '@/store/lotteryStore';
import Wheel from './Wheel';
import ResultModal from './ResultModal';
import RecordPanel from './RecordPanel';
import ConfigPanel from './ConfigPanel';

const SPIN_DURATION = 4000;
const MIN_ROTATION = 1800;
const MAX_EXTRA_ROTATION = 1440;

export default function LotteryWheel() {
  const { prizes, isSpinning, result, showResult, spin, setIsSpinning, setShowResult } =
    useLotteryStore();
  const [rotation, setRotation] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const spinningRef = useRef(false);
  const animRef = useRef(0);

  const handleSpinEnd = useCallback(() => {
    setShowResult(true);
  }, [setShowResult]);

  const handleSpin = useCallback(() => {
    if (spinningRef.current || prizes.length < 2) return;

    const winner = spin();
    spinningRef.current = true;

    // 计算目标角度：找到中奖奖品的扇区中心
    const sliceAngle = 360 / prizes.length;
    const winnerIndex = prizes.findIndex((p) => p.id === winner.id);
    // 指针在顶部（-90度位置），需要让该扇区对准顶部
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    // 转盘需要旋转到 (360 - targetSliceCenter) 度才能让该扇区对准顶部指针
    const targetAngle = 360 - targetSliceCenter;
    // 加上随机偏移（在扇区内）
    const randomOffset = (Math.random() - 0.5) * sliceAngle * 0.6;
    const finalTarget = targetAngle + randomOffset;

    // 总旋转 = 当前角度 + 基础多圈 + 目标偏移
    const extraRotation = MIN_ROTATION + Math.random() * MAX_EXTRA_ROTATION;
    const totalRotation = rotation + extraRotation + finalTarget - (rotation % 360);

    const startTime = performance.now();
    const startRotation = rotation;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);

      // 缓出曲线：先快后慢
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + (totalRotation - startRotation) * eased;

      setRotation(currentRotation);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        spinningRef.current = false;
        setIsSpinning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [prizes, rotation, spin, setIsSpinning]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 转盘区域 */}
      <div className="relative">
        <Wheel rotation={rotation} onSpinEnd={handleSpinEnd} />

        {/* 抽奖按钮 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || prizes.length < 2}
          className="mt-6 px-10 py-3.5 text-lg font-bold rounded-full
            bg-gradient-to-b from-yellow-400 to-yellow-600
            text-gray-900 shadow-[0_4px_12px_rgba(255,215,0,0.4)]
            hover:from-yellow-300 hover:to-yellow-500
            hover:shadow-[0_6px_20px_rgba(255,215,0,0.6)]
            active:scale-95 active:shadow-[0_2px_6px_rgba(255,215,0,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            transition-all duration-200 relative overflow-hidden"
        >
          {isSpinning ? '抽奖中...' : '开始抽奖'}
          {!isSpinning && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
          )}
        </button>
      </div>

      {/* 操作栏 */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowRecords(!showRecords)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-sm border border-white/10"
        >
          抽奖记录
        </button>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-sm border border-white/10"
        >
          奖品配置
        </button>
      </div>

      {/* 中奖结果弹窗 */}
      {showResult && result && (
        <ResultModal
          prize={result}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* 抽奖记录面板 */}
      {showRecords && <RecordPanel onClose={() => setShowRecords(false)} />}

      {/* 奖品配置面板 */}
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
    </div>
  );
}
