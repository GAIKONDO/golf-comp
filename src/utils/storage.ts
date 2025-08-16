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
  par: number
): PlayerScore[] => {
  return scores.map(playerScore => {
    if (playerScore.playerId === playerId) {
      const updatedScores = playerScore.scores.map(holeScore => 
        holeScore.holeNumber === holeNumber 
          ? { ...holeScore, score, par }
          : holeScore
      );
      
      // 新しいホールのスコアを追加（存在しない場合）
      if (!updatedScores.find(s => s.holeNumber === holeNumber)) {
        updatedScores.push({ holeNumber, score, par });
      }
      
      const totalScore = updatedScores.reduce((sum, hole) => sum + hole.score, 0);
      const totalPar = updatedScores.reduce((sum, hole) => sum + hole.par, 0);
      
      return {
        ...playerScore,
        scores: updatedScores,
        totalScore,
        totalPar,
        netScore: totalScore - totalPar
      };
    }
    return playerScore;
  });
};

// ランキングを取得（オリンピック形式）
export const getRanking = (scores: PlayerScore[]): PlayerScore[] => {
  return [...scores].sort((a, b) => a.netScore - b.netScore);
};
