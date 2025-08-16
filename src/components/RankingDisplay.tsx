'use client';

import { PlayerScore } from '@/types';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';

interface RankingDisplayProps {
  ranking: PlayerScore[];
}

export default function RankingDisplay({ ranking }: RankingDisplayProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <StarIcon className="w-6 h-6 text-gray-400" />;
      case 2:
        return <StarIcon className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 text-gray-400 text-center text-sm font-bold">{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 border-yellow-200';
      case 1:
        return 'bg-gray-50 border-gray-200';
      case 2:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getPlayerCurrentHole = (player: PlayerScore) => {
    if (player.scores.length === 0) return 1;
    
    const sortedScores = [...player.scores].sort((a, b) => b.holeNumber - a.holeNumber);
    return sortedScores[0].holeNumber;
  };

  const getPlayerProgress = (player: PlayerScore) => {
    return player.scores.length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
        リアルタイムランキング
      </h2>

      {ranking.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">スコアが入力されていません</p>
          <p className="text-sm text-gray-300">プレイヤーを登録してスコアを入力してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((player, index) => {
            const currentHole = getPlayerCurrentHole(player);
            const progress = getPlayerProgress(player);
            
            return (
              <div
                key={player.playerId}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${getRankColor(index)}`}
              >
                <div className="flex items-center justify-center w-8 h-8 mr-4">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{player.playerName}</div>
                  <div className="text-sm text-gray-500">{player.groupName}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    進行状況: {progress}/18ホール | 現在: {currentHole}ホール
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">
                    {player.netScore > 0 ? '+' : ''}{player.netScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    合計: {player.totalScore}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 統計情報 */}
      {ranking.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">統計情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">参加者数</div>
              <div className="text-xl font-bold text-blue-800">{ranking.length}人</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">ベストスコア</div>
              <div className="text-xl font-bold text-green-800">
                {ranking[0]?.netScore > 0 ? '+' : ''}{ranking[0]?.netScore || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600">平均スコア</div>
              <div className="text-xl font-bold text-purple-800">
                {ranking.length > 0 
                  ? (ranking.reduce((sum, p) => sum + p.netScore, 0) / ranking.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-600">組数</div>
              <div className="text-xl font-bold text-orange-800">
                {new Set(ranking.map(p => p.groupId)).size}組
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
