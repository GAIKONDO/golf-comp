'use client';

import { useState } from 'react';
import { Group, PlayerScore } from '@/types';
import { updateScore } from '@/utils/storage';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ScoreInputProps {
  groups: Group[];
  scores: PlayerScore[];
  currentHole: number;
  onScoresChange: (scores: PlayerScore[]) => void;
  onCurrentHoleChange: (hole: number) => void;
}

export default function ScoreInput({ 
  groups, 
  scores, 
  currentHole, 
  onScoresChange, 
  onCurrentHoleChange 
}: ScoreInputProps) {
  const [parInputs, setParInputs] = useState<{ [key: string]: number }>({});
  const [confirmedScores, setConfirmedScores] = useState<{ [key: string]: { [hole: number]: boolean } }>({});

  const allPlayers = groups.flatMap(group => group.players);

  const handleScoreChange = (playerId: string, score: number) => {
    const par = parInputs[playerId] || 4; // デフォルトパー4
    const updatedScores = updateScore(scores, playerId, currentHole, score, par);
    onScoresChange(updatedScores);
  };

  const handleParChange = (playerId: string, par: number) => {
    setParInputs(prev => ({ ...prev, [playerId]: par }));
    
    // 既存のスコアがある場合は更新
    const existingScore = scores.find(s => s.playerId === playerId);
    if (existingScore) {
      const holeScore = existingScore.scores.find(s => s.holeNumber === currentHole);
      if (holeScore) {
        const updatedScores = updateScore(scores, playerId, currentHole, holeScore.score, par);
        onScoresChange(updatedScores);
      }
    }
  };

  const handleConfirmGroupScores = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    let updatedScores = [...scores];
    const newConfirmedScores = { ...confirmedScores };

    group.players.forEach(player => {
      const currentScore = getCurrentScore(player.id);
      if (currentScore !== null) {
        const par = getDefaultPar(player.id);
        updatedScores = updateScore(updatedScores, player.id, currentHole, currentScore, par);
        
        // 確定状態を更新
        newConfirmedScores[player.id] = {
          ...newConfirmedScores[player.id],
          [currentHole]: true
        };
      }
    });

    onScoresChange(updatedScores);
    setConfirmedScores(newConfirmedScores);
  };

  const handleResetGroupScores = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const updatedScores = [...scores];
    const newConfirmedScores = { ...confirmedScores };

    group.players.forEach(player => {
      // 現在のホールのスコアを削除
      const playerScore = updatedScores.find(s => s.playerId === player.id);
      if (playerScore) {
        playerScore.scores = playerScore.scores.filter(s => s.holeNumber !== currentHole);
        
        // 合計スコアを再計算
        const totalScore = playerScore.scores.reduce((sum, hole) => sum + hole.score, 0);
        const totalPar = playerScore.scores.reduce((sum, hole) => sum + hole.par, 0);
        
        playerScore.totalScore = totalScore;
        playerScore.totalPar = totalPar;
        playerScore.netScore = totalScore - totalPar;
      }
      
      // 確定状態をリセット
      if (newConfirmedScores[player.id]) {
        delete newConfirmedScores[player.id][currentHole];
      }
    });

    onScoresChange(updatedScores);
    setConfirmedScores(newConfirmedScores);
  };

  const getPlayerScore = (playerId: string) => {
    const playerScore = scores.find(s => s.playerId === playerId);
    return playerScore?.scores.find(s => s.holeNumber === currentHole);
  };

  const getCurrentScore = (playerId: string) => {
    const holeScore = getPlayerScore(playerId);
    if (holeScore) {
      return holeScore.score;
    }
    return getDefaultPar(playerId);
  };

  const getPlayerTotalScore = (playerId: string) => {
    const playerScore = scores.find(s => s.playerId === playerId);
    return playerScore?.totalScore || 0;
  };

  const getPlayerNetScore = (playerId: string) => {
    const playerScore = scores.find(s => s.playerId === playerId);
    return playerScore?.netScore || 0;
  };

  const getDefaultPar = (playerId: string) => {
    return parInputs[playerId] || 4;
  };

  const getDefaultScore = (playerId: string) => {
    const holeScore = getPlayerScore(playerId);
    if (holeScore) {
      return holeScore.score;
    }
    // スコアが未入力の場合はパーをデフォルト値として表示
    return getDefaultPar(playerId);
  };

  const isScoreConfirmed = (playerId: string) => {
    return confirmedScores[playerId]?.[currentHole] || false;
  };

  const getPlayerProgress = (playerId: string) => {
    const playerScore = scores.find(s => s.playerId === playerId);
    if (!playerScore) return 0;
    return playerScore.scores.length;
  };

  const getPlayerCurrentHole = (playerId: string) => {
    const playerScore = scores.find(s => s.playerId === playerId);
    if (!playerScore || playerScore.scores.length === 0) return 1;
    
    const sortedScores = [...playerScore.scores].sort((a, b) => b.holeNumber - a.holeNumber);
    return sortedScores[0].holeNumber;
  };

  const isGroupAllConfirmed = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;
    
    return group.players.every(player => isScoreConfirmed(player.id));
  };

  const hasGroupScores = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;
    
    return group.players.some(player => {
      const playerScore = scores.find(s => s.playerId === player.id);
      return playerScore?.scores.some(s => s.holeNumber === currentHole);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">スコア入力</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onCurrentHoleChange(Math.max(1, currentHole - 1))}
            disabled={currentHole === 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-xl font-bold text-blue-600">
            {currentHole}ホール
          </span>
          <button
            onClick={() => onCurrentHoleChange(Math.min(18, currentHole + 1))}
            disabled={currentHole === 18}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {allPlayers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          プレイヤーを登録してください
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const groupAllConfirmed = isGroupAllConfirmed(group.id);
            const groupHasScores = hasGroupScores(group.id);
            
            return (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResetGroupScores(group.id)}
                      disabled={!groupHasScores}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                        groupHasScores
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={groupHasScores ? '組全体のスコアをリセット' : 'リセットするスコアがありません'}
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>リセット</span>
                    </button>
                    <button
                      onClick={() => handleConfirmGroupScores(group.id)}
                      disabled={groupAllConfirmed}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                        groupAllConfirmed 
                          ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title={groupAllConfirmed ? '全員確定済み' : '組全体のスコアを確定'}
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>組確定</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {group.players.map(player => {
                    const holeScore = getPlayerScore(player.id);
                    const totalScore = getPlayerTotalScore(player.id);
                    const netScore = getPlayerNetScore(player.id);
                    const par = getDefaultPar(player.id);

                    const scoreConfirmed = isScoreConfirmed(player.id);
                    const currentScore = getCurrentScore(player.id);
                    const playerProgress = getPlayerProgress(player.id);
                    const playerCurrentHole = getPlayerCurrentHole(player.id);

                    return (
                      <div key={player.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            合計: {totalScore} | ネット: {netScore > 0 ? '+' : ''}{netScore}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            進行状況: {playerProgress}/18ホール | 現在: {playerCurrentHole}ホール
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">パー:</label>
                          <input
                            type="number"
                            min="3"
                            max="6"
                            value={par}
                            onChange={(e) => handleParChange(player.id, parseInt(e.target.value) || 4)}
                            className="w-12 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">スコア:</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={currentScore}
                            onChange={(e) => handleScoreChange(player.id, parseInt(e.target.value) || 0)}
                            className={`w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              scoreConfirmed ? 'text-red-600 font-semibold' : 'text-gray-900'
                            }`}
                            placeholder={par.toString()}
                          />
                        </div>
                        
                        {holeScore && (
                          <div className="text-sm">
                            {holeScore.score > holeScore.par ? (
                              <span className="text-red-600">+{holeScore.score - holeScore.par}</span>
                            ) : holeScore.score < holeScore.par ? (
                              <span className="text-green-600">{holeScore.score - holeScore.par}</span>
                            ) : (
                              <span className="text-gray-600">E</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ホールナビゲーション */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
            <button
              key={hole}
              onClick={() => onCurrentHoleChange(hole)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                hole === currentHole
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {hole}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
