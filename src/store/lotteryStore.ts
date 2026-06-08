import { create } from 'zustand';
import type { Prize, LotteryRecord } from '@/types';

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', name: '一等奖', color: '#FFD700', probability: 1 },
  { id: '2', name: '二等奖', color: '#FF6B6B', probability: 3 },
  { id: '3', name: '三等奖', color: '#4ECDC4', probability: 5 },
  { id: '4', name: '幸运奖', color: '#A8E6CF', probability: 10 },
  { id: '5', name: '谢谢参与', color: '#95A5A6', probability: 30 },
];

function loadRecords(): LotteryRecord[] {
  try {
    const data = localStorage.getItem('lottery-records');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: LotteryRecord[]) {
  localStorage.setItem('lottery-records', JSON.stringify(records));
}

function loadPrizes(): Prize[] {
  try {
    const data = localStorage.getItem('lottery-prizes');
    return data ? JSON.parse(data) : DEFAULT_PRIZES;
  } catch {
    return DEFAULT_PRIZES;
  }
}

function savePrizes(prizes: Prize[]) {
  localStorage.setItem('lottery-prizes', JSON.stringify(prizes));
}

interface LotteryState {
  prizes: Prize[];
  records: LotteryRecord[];
  isSpinning: boolean;
  result: Prize | null;
  showResult: boolean;

  setPrizes: (prizes: Prize[]) => void;
  addPrize: () => void;
  removePrize: (id: string) => void;
  updatePrize: (id: string, updates: Partial<Prize>) => void;
  spin: () => Prize;
  setResult: (prize: Prize | null) => void;
  setShowResult: (show: boolean) => void;
  setIsSpinning: (spinning: boolean) => void;
  clearRecords: () => void;
}

function weightedRandom(prizes: Prize[]): Prize {
  const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalWeight;
  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) return prize;
  }
  return prizes[prizes.length - 1];
}

export const useLotteryStore = create<LotteryState>((set, get) => ({
  prizes: loadPrizes(),
  records: loadRecords(),
  isSpinning: false,
  result: null,
  showResult: false,

  setPrizes: (prizes) => {
    savePrizes(prizes);
    set({ prizes });
  },

  addPrize: () => {
    const { prizes, setPrizes } = get();
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: `奖品${prizes.length + 1}`,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      probability: 5,
    };
    setPrizes([...prizes, newPrize]);
  },

  removePrize: (id) => {
    const { prizes, setPrizes } = get();
    if (prizes.length <= 2) return;
    setPrizes(prizes.filter((p) => p.id !== id));
  },

  updatePrize: (id, updates) => {
    const { prizes, setPrizes } = get();
    setPrizes(prizes.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  },

  spin: () => {
    const { prizes } = get();
    const winner = weightedRandom(prizes);
    const record: LotteryRecord = {
      id: Date.now().toString(),
      prizeId: winner.id,
      prizeName: winner.name,
      timestamp: new Date().toLocaleString('zh-CN'),
    };
    const records = [record, ...get().records];
    saveRecords(records);
    set({ records, result: winner, isSpinning: true });
    return winner;
  },

  setResult: (prize) => set({ result: prize }),
  setShowResult: (show) => set({ showResult: show }),
  setIsSpinning: (spinning) => set({ isSpinning: spinning }),
  clearRecords: () => {
    saveRecords([]);
    set({ records: [] });
  },
}));
