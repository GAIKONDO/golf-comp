'use client';

import { useState } from 'react';
import { Group, PlayerScore } from '@/types';
import { addGroup, addPlayer } from '@/utils/supabase';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface GroupManagerProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
  onScoresChange: (scores: PlayerScore[]) => void;
}

export default function GroupManager({ groups, onGroupsChange, onScoresChange }: GroupManagerProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      const updatedGroups = await addGroup(groups, newGroupName.trim());
      onGroupsChange(updatedGroups);
      setNewGroupName('');
    }
  };

  const handleAddPlayer = async () => {
    if (selectedGroupId && newPlayerName.trim()) {
      const updatedGroups = await addPlayer(groups, selectedGroupId, newPlayerName.trim());
      onGroupsChange(updatedGroups);
      setNewPlayerName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <PlusIcon className="w-6 h-6 mr-2 text-blue-600" />
        組・プレイヤー管理
      </h2>

      {/* 組追加 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">組を追加</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="組名を入力"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {/* プレイヤー追加 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <UserPlusIcon className="w-5 h-5 mr-2 text-green-600" />
          プレイヤーを追加
        </h3>
        <div className="space-y-3">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">組を選択</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.players.length}/4人)
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="プレイヤー名を入力"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button
              onClick={handleAddPlayer}
              disabled={!selectedGroupId || !newPlayerName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              追加
            </button>
          </div>
        </div>
      </div>

      {/* 組一覧 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">組一覧</h3>
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="border border-gray-200 rounded-md p-3">
              <h4 className="font-semibold text-gray-800 mb-2">{group.name}</h4>
              <div className="space-y-1">
                {group.players.map(player => (
                  <div key={player.id} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {player.name}
                  </div>
                ))}
                {group.players.length === 0 && (
                  <p className="text-sm text-gray-400">プレイヤーが登録されていません</p>
                )}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-gray-400 text-center py-4">組が登録されていません</p>
          )}
        </div>
      </div>
    </div>
  );
}
