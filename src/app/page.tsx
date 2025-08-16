'use client';

import { useState, useEffect } from 'react';
import { AppState } from '@/types';
import { getAppState, saveAppState, subscribeToAppState, getRanking } from '@/utils/supabase';
import GroupManager from '@/components/GroupManager';
import ScoreInput from '@/components/ScoreInput';
import RankingDisplay from '@/components/RankingDisplay';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    groups: [],
    scores: [],
    currentHole: 1
  });

  // 初期データの読み込みとリアルタイム同期
  useEffect(() => {
    const loadData = async () => {
      const savedData = await getAppState();
      setAppState(savedData);
    };
    
    loadData();

    // リアルタイムでデータの変更を監視
    const subscription = subscribeToAppState((newAppState) => {
      setAppState(newAppState);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // データが変更されたら保存
  useEffect(() => {
    const saveData = async () => {
      await saveAppState(appState);
    };
    
    if (appState.groups.length > 0 || appState.scores.length > 0) {
      saveData();
    }
  }, [appState]);

  const updateAppState = (newState: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...newState }));
  };

  const ranking = getRanking(appState.scores);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏌️ ゴルフコンペ - リアルタイム共有版
          </h1>
          <p className="text-gray-600">
            リアルタイムスコア管理システム
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 組管理とスコア入力 */}
          <div className="space-y-6">
            <GroupManager 
              groups={appState.groups}
              onGroupsChange={(groups) => updateAppState({ groups })}
            />
            
            <ScoreInput 
              groups={appState.groups}
              scores={appState.scores}
              currentHole={appState.currentHole}
              onScoresChange={(scores) => updateAppState({ scores })}
              onCurrentHoleChange={(hole) => updateAppState({ currentHole: hole })}
            />
          </div>

          {/* 右側: ランキング表示 */}
          <div>
            <RankingDisplay ranking={ranking} />
          </div>
        </div>
      </div>
    </div>
  );
}
