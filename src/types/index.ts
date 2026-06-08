export interface Prize {
  id: string;
  name: string;
  color: string;
  probability: number;
}

export interface LotteryRecord {
  id: string;
  prizeId: string;
  prizeName: string;
  timestamp: string;
}
