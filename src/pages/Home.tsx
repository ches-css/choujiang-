import LotteryWheel from '@/components/LotteryWheel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      {/* 标题 */}
      <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 mb-8 relative z-10 tracking-wider">
        幸运大转盘
      </h1>

      {/* 转盘主体 */}
      <div className="relative z-10">
        <LotteryWheel />
      </div>

      {/* 底部提示 */}
      <p className="mt-8 text-white/20 text-xs relative z-10">
        点击按钮开始抽奖 · 奖品可在配置面板中自定义
      </p>
    </div>
  );
}
