import { useLotteryStore } from '@/store/lotteryStore';
import { X, Trash2, Clock } from 'lucide-react';

interface RecordPanelProps {
  onClose: () => void;
}

export default function RecordPanel({ onClose }: RecordPanelProps) {
  const records = useLotteryStore((s) => s.records);
  const clearRecords = useLotteryStore((s) => s.clearRecords);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900/95 backdrop-blur-md border-l border-white/10 h-full overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">抽奖记录</h3>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={clearRecords}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                title="清空记录"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {records.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              <Clock className="mx-auto mb-3" size={32} />
              <p>暂无抽奖记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record, i) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-xs text-white/40 whitespace-nowrap">
                    {record.timestamp}
                  </span>
                  <span className="text-sm text-white/80 font-medium truncate">
                    {record.prizeName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
