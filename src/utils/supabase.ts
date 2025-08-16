import { supabase } from '@/lib/supabase';
import { AppState, Group, PlayerScore } from '@/types';

// アプリケーション全体の状態を取得
export const getAppState = async (): Promise<AppState> => {
  const { data, error } = await supabase
    .from('app_state')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching app state:', error);
  }

  return data || {
    groups: [],
    scores: [],
    currentHole: 1
  };
};

// アプリケーション全体の状態を保存
export const saveAppState = async (appState: AppState): Promise<void> => {
  const { error } = await supabase
    .from('app_state')
    .upsert({
      id: 1,
      groups: appState.groups,
      scores: appState.scores,
      current_hole: appState.currentHole,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving app state:', error);
  }
};

// リアルタイムでアプリケーション状態の変更を監視
export const subscribeToAppState = (callback: (appState: AppState) => void) => {
  return supabase
    .channel('app_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state'
      },
      (payload) => {
        if (payload.new) {
          const appState: AppState = {
            groups: payload.new.groups || [],
            scores: payload.new.scores || [],
            currentHole: payload.new.current_hole || 1
          };
          callback(appState);
        }
      }
    )
    .subscribe();
};

// 組を追加
export const addGroup = async (groups: Group[], groupName: string): Promise<Group[]> => {
  const newGroup: Group = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: groupName,
    players: []
  };

  const updatedGroups = [...groups, newGroup];
  await saveAppState({ groups: updatedGroups, scores: [], currentHole: 1 });
  return updatedGroups;
};

// プレイヤーを追加
export const addPlayer = async (groups: Group[], groupId: string, playerName: string): Promise<Group[]> => {
  const newPlayer = {
    id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: playerName,
    groupId: groupId
  };

  const updatedGroups = groups.map(group => {
    if (group.id === groupId) {
      return {
        ...group,
        players: [...group.players, newPlayer]
      };
    }
    return group;
  });

  await saveAppState({ groups: updatedGroups, scores: [], currentHole: 1 });
  return updatedGroups;
};

// スコアを更新
export const updateScore = async (
  scores: PlayerScore[],
  playerId: string,
  holeNumber: number,
  score: number,
  par: number,
  groups: Group[] = []
): Promise<PlayerScore[]> => {
  // eslint-disable-next-line prefer-const
  let updatedScores = [...scores];
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
