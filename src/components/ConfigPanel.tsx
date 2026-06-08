import { useLotteryStore } from '@/store/lotteryStore';
import { X, Plus, Trash2, Settings } from 'lucide-react';

interface ConfigPanelProps {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: ConfigPanelProps) {
  const prizes = useLotteryStore((s) => s.prizes);
  const addPrize = useLotteryStore((s) => s.addPrize);
  const removePrize = useLotteryStore((s) => s.removePrize);
  const updatePrize = useLotteryStore((s) => s.updatePrize);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto animate-slide-in-up">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Settings className="text-yellow-400" size={18} />
            <h3 className="text-lg font-bold text-white">奖品配置</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <input
                type="color"
                value={prize.color}
                onChange={(e) => updatePrize(prize.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={prize.name}
                onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-white/40">权重</span>
                <input
                  type="number"
                  value={prize.probability}
                  min={1}
                  max={100}
                  onChange={(e) =>
                    updatePrize(prize.id, {
                      probability: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
              <button
                onClick={() => removePrize(prize.id)}
                disabled={prizes.length <= 2}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={addPrize}
            className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-white/50 hover:text-white hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            添加奖品
          </button>

          <p className="text-xs text-white/30 text-center pt-2">
            至少保留 2 个奖品 · 权重越大中奖概率越高
          </p>
        </div>
      </div>
    </div>
  );
}
