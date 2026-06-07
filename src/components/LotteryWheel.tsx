import { useState, useRef, useEffect, useCallback } from 'react';

const PRIZES = [
  { name: '一等奖', color: '#FFD700', textColor: '#8B0000' },
  { name: '二等奖', color: '#C41E3A', textColor: '#FFD700' },
  { name: '三等奖', color: '#FF8C00', textColor: '#fff' },
  { name: '四等奖', color: '#FFD700', textColor: '#8B0000' },
  { name: '五等奖', color: '#228B22', textColor: '#fff' },
  { name: '幸运奖', color: '#4169E1', textColor: '#fff' },
];

const ROTATION_DURATION = 3000;
const EXTRA_ROTATIONS = 5;

interface AudioManagerType {
  startRotate: () => void;
  stopRotate: () => void;
  playWin: () => void;
}

function createAudioManager(): AudioManagerType {
  const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() : null;
  
  let rotateOscillator: OscillatorNode | null = null;
  let rotateGain: GainNode | null = null;
  let rotateInterval: ReturnType<typeof setInterval> | null = null;

  const startRotate = () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    rotateOscillator = audioContext.createOscillator();
    rotateGain = audioContext.createGain();
    
    rotateOscillator.type = 'sine';
    rotateOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    rotateGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    rotateOscillator.connect(rotateGain);
    rotateGain.connect(audioContext.destination);
    
    rotateOscillator.start();
    
    let freq = 800;
    rotateInterval = setInterval(() => {
      if (rotateOscillator && rotateGain && audioContext) {
        freq = 600 + Math.random() * 400;
        rotateOscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      }
    }, 100);
  };

  const stopRotate = () => {
    if (rotateInterval) clearInterval(rotateInterval);
    if (rotateOscillator) {
      rotateOscillator.stop();
      rotateOscillator.disconnect();
    }
    if (rotateGain) {
      rotateGain.disconnect();
    }
    rotateOscillator = null;
    rotateGain = null;
    rotateInterval = null;
  };

  const playWin = () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const times = [0, 0.15, 0.3, 0.5, 0.7];
    const freqs = [523, 659, 784, 1047, 1319];
    
    times.forEach((time, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freqs[i], audioContext.currentTime + time);
      
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime + time);
      osc.stop(audioContext.currentTime + time + 0.3);
    });
  };

  return { startRotate, stopRotate, playWin };
}

export default function LotteryWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultPrize, setResultPrize] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<AudioManagerType | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioRef.current = createAudioManager();
    return () => {
      audioRef.current?.stopRotate();
    };
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || !audioRef.current) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setShowConfetti(false);
    
    audioRef.current.startRotate();
    
    const extraRotations = EXTRA_ROTATIONS * 360;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraRotations + randomAngle;
    
    setRotation(totalRotation);
    
    setTimeout(() => {
      audioRef.current?.stopRotate();
      audioRef.current?.playWin();
      
      const normalizedAngle = ((totalRotation % 360) + 360) % 360;
      const prizeIndex = Math.floor((360 - normalizedAngle) / 60) % 6;
      const prize = PRIZES[prizeIndex];
      
      setResultPrize(prize.name);
      setShowResult(true);
      setShowConfetti(true);
      setIsSpinning(false);
    }, ROTATION_DURATION);
  }, [isSpinning, rotation]);

  const closeResult = () => {
    setShowResult(false);
    setShowConfetti(false);
  };

  const confettiColors = ['#FFD700', '#C41E3A', '#FF8C00', '#228B22', '#4169E1', '#FF69B4'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] via-[#C41E3A] to-[#8B0000] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FFD700] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 right-0 w-48 h-48 bg-[#FFD700] opacity-10 rounded-full blur-3xl translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#FFD700] opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-8 text-center drop-shadow-lg animate-float z-10">
        🎊 幸运抽奖 🎊
      </h1>

      {/* Wheel container */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 z-10">
        {/* Pointer */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
          <div 
            className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-[#FFD700]"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
            }}
          />
          <div className="w-8 h-4 bg-[#FFD700] mx-auto -mt-1 rounded-b-full" />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full relative transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? `${ROTATION_DURATION}ms` : '0ms',
          }}
        >
          {/* Wheel segments */}
            {PRIZES.map((prize, index) => {
              const angle = index * 60;
              return (
                <div
                  key={index}
                  className="absolute w-full h-full"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((30 + index * 60) * Math.PI / 180)}% 0%)`,
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <svg className="absolute w-full h-full" viewBox="0 0 200 200">
                    <path
                      d={`
                        M 100 100
                        L ${100 + 90 * Math.cos((index * 60 - 30) * Math.PI / 180)} ${100 + 90 * Math.sin((index * 60 - 30) * Math.PI / 180)}
                        A 90 90 0 0 1 ${100 + 90 * Math.cos((index * 60 + 30) * Math.PI / 180)} ${100 + 90 * Math.sin((index * 60 + 30) * Math.PI / 180)}
                        Z
                      `}
                      fill={prize.color}
                      stroke="#FFD700"
                      strokeWidth="3"
                    />
                  </svg>
                  <div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 text-sm md:text-base font-bold whitespace-nowrap"
                    style={{ 
                      color: prize.textColor,
                      transform: `rotate(${60 - angle}deg)`,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {prize.name}
                  </div>
                </div>
              );
            })}
          
          {/* Center decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#8B0000] border-4 border-[#FFD700] flex items-center justify-center shadow-xl z-10">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#FFD700] to-[#DAA520] opacity-20" />
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-20 h-20 md:w-24 md:h-24
            rounded-full
            bg-gradient-to-br from-[#FFD700] to-[#DAA520]
            border-4 border-[#FFF8DC]
            text-[#8B0000] font-bold text-lg md:text-xl
            shadow-lg
            transition-all duration-200
            z-20
            ${isSpinning 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-110 hover:shadow-xl animate-pulse-glow cursor-pointer'
            }
          `}
        >
          {isSpinning ? '...' : '开始'}
        </button>

        {/* Outer ring decoration */}
        <div className="absolute inset-0 rounded-full border-8 border-[#FFD700] opacity-50 pointer-events-none" />
        <div className="absolute inset-[-8px] rounded-full border-4 border-dashed border-[#FFD700] opacity-30 pointer-events-none" />
      </div>

      {/* Result modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#C41E3A] to-[#8B0000] rounded-3xl p-8 md:p-12 text-center border-4 border-[#FFD700] shadow-2xl max-w-sm w-full relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#FFD700] rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-[#FFD700] rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-[#FFD700] rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#FFD700] rounded-br-lg" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-4 drop-shadow-lg">
              🎉 恭喜您 🎉
            </h2>
            <p className="text-4xl md:text-5xl font-bold text-white mb-8 animate-pulse">
              {resultPrize}
            </p>
            <button
              onClick={closeResult}
              className="px-8 py-3 bg-gradient-to-br from-[#FFD700] to-[#DAA520] text-[#8B0000] font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              再抽一次
            </button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-[#FFD700]/60 text-sm mt-8 text-center z-10">
        点击中间按钮开始抽奖
      </p>
    </div>
  );
}
