import { AppState, Group, PlayerScore } from '@/types';

const STORAGE_KEY = 'golf-comp-data';

// データをローカルストレージに保存
export const saveToStorage = (data: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
  }
};

// ローカルストレージからデータを読み込み
export const loadFromStorage = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
  }
  
  // デフォルトの初期状態を返す
  return {
    groups: [],
    scores: [],
    currentHole: 1
  };
};

// 組を追加
export const addGroup = (groups: Group[], groupName: string): Group[] => {
  const newGroup: Group = {
    id: `group-${Date.now()}`,
    name: groupName,
    players: []
  };
  return [...groups, newGroup];
};

// プレイヤーを追加
export const addPlayer = (groups: Group[], groupId: string, playerName: string): Group[] => {
  return groups.map(group => {
    if (group.id === groupId && group.players.length < 4) {
      const newPlayer = {
        id: `player-${Date.now()}`,
        name: playerName,
        groupId: groupId
      };
      return {
        ...group,
        players: [...group.players, newPlayer]
      };
    }
    return group;
  });
};

// スコアを更新
export const updateScore = (
  scores: PlayerScore[],
  playerId: string,
  holeNumber: number,
  score: number,
  par: number,
  groups: Group[] = []
): PlayerScore[] => {
  const updatedScores = [...scores];
  const existingPlayerScore = updatedScores.find(s => s.playerId === playerId);

  if (existingPlayerScore) {
    // 既存のプレイヤーのスコアを更新
    const existingHoleScore = existingPlayerScore.scores.find(s => s.holeNumber === holeNumber);
    if (existingHoleScore) {
      existingHoleScore.score = score;
      existingHoleScore.par = par;
    } else {
      existingPlayerScore.scores.push({ holeNumber, score, par });
    }

    // 合計スコアを再計算
    const totalScore = existingPlayerScore.scores.reduce((sum, hole) => sum + hole.score, 0);
    const totalPar = existingPlayerScore.scores.reduce((sum, hole) => sum + hole.par, 0);
    existingPlayerScore.totalScore = totalScore;
    existingPlayerScore.totalPar = totalPar;
    existingPlayerScore.netScore = totalScore - totalPar;
  } else {
    // 新しいプレイヤーのスコアを作成
    const player = groups.flatMap(g => g.players).find(p => p.id === playerId);
    const group = groups.find(g => g.players.some(p => p.id === playerId));

    if (player && group) {
      const newPlayerScore: PlayerScore = {
        playerId: player.id,
        playerName: player.name,
        groupId: group.id,
        groupName: group.name,
        scores: [{ holeNumber, score, par }],
        totalScore: score,
        totalPar: par,
        netScore: score - par
      };
      updatedScores.push(newPlayerScore);
    }
  }

  return updatedScores;
};

// ランキングを取得（オリンピック形式）
export const getRanking = (scores: PlayerScore[]): PlayerScore[] => {
  return [...scores].sort((a, b) => a.netScore - b.netScore);
};
