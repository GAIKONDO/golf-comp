// プレイヤーの型定義
export interface Player {
  id: string;
  name: string;
  groupId: string;
}

// 組の型定義
export interface Group {
  id: string;
  name: string;
  players: Player[];
}

// ホールのスコア型定義
export interface HoleScore {
  holeNumber: number;
  score: number;
  par: number;
}

// プレイヤーのスコア型定義
export interface PlayerScore {
  playerId: string;
  playerName: string;
  groupId: string;
  groupName: string;
  scores: HoleScore[];
  totalScore: number;
  totalPar: number;
  netScore: number; // オリンピック形式用
}

// アプリケーション全体の状態型定義
export interface AppState {
  groups: Group[];
  scores: PlayerScore[];
  currentHole: number;
}
