import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ProtocolClient, StakingInfo } from '../services/protocol-client';

interface UserProfileProps {
  protocolClient: ProtocolClient | null;
}

interface StakingHistory {
  id: string;
  action: 'stake' | 'unstake' | 'claim';
  amount: number;
  timestamp: Date;
  tier: number;
  txHash: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ protocolClient }) => {
  const { publicKey } = useWallet();
  const [userInfo, setUserInfo] = useState<StakingInfo | null>(null);
  const [stakingHistory, setStakingHistory] = useState<StakingHistory[]>([]);
  const [loyaltyLevel, setLoyaltyLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (protocolClient && publicKey) {
      fetchUserData();
    }
  }, [protocolClient, publicKey]);

  const fetchUserData = async () => {
    if (!protocolClient || !publicKey) return;

    try {
      setLoading(true);
      const info = await protocolClient.getUserInfo(publicKey);
      setUserInfo(info);

      // Calculate loyalty level based on score
      if (info) {
        const level = Math.min(Math.floor(info.loyaltyScore / 100) + 1, 10);
        setLoyaltyLevel(level);
      }

      // Mock staking history
      const mockHistory: StakingHistory[] = [
        {
          id: '1',
          action: 'stake',
          amount: 1000,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          tier: 1,
          txHash: '0x1234...5678',
        },
        {
          id: '2',
          action: 'claim',
          amount: 25,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tier: 1,
          txHash: '0x8765...4321',
        },
        {
          id: '3',
          action: 'stake',
          amount: 2000,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tier: 2,
          txHash: '0xabcd...efgh',
        },
      ];
      setStakingHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoyaltyLevelColor = (level: number) => {
    if (level >= 8) return 'from-purple-500 to-pink-500';
    if (level >= 6) return 'from-blue-500 to-cyan-500';
    if (level >= 4) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-gray-600';
  };

  const getLoyaltyLevelName = (level: number) => {
    if (level >= 8) return 'Diamond';
    if (level >= 6) return 'Platinum';
    if (level >= 4) return 'Gold';
    if (level >= 2) return 'Silver';
    return 'Bronze';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'stake': return '⬆️';
      case 'unstake': return '⬇️';
      case 'claim': return '💰';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'stake': return 'text-green-400';
      case 'unstake': return 'text-red-400';
      case 'claim': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">User Profile</h2>

      {/* Wallet Info */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Address</h3>
          <div className="bg-white/10 rounded-lg px-3 py-1">
            <span className="text-gray-300 text-sm font-mono">
              {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Not connected'}
            </span>
          </div>
        </div>
      </div>

      {/* User Stats */}
      {userInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current Stake</p>
                <p className="text-2xl font-bold text-white">{userInfo.currentStake.toFixed(2)} SOL</p>
              </div>
              <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current Tier</p>
                <p className="text-2xl font-bold text-white">Tier {userInfo.tier}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Loyalty Score</p>
                <p className="text-2xl font-bold text-white">{userInfo.loyaltyScore}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Staked Since</p>
                <p className="text-lg font-bold text-white">
                  {userInfo.stakedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Level */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Loyalty Level</h3>
            <p className="text-gray-300">Your current loyalty status and benefits</p>
          </div>
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getLoyaltyLevelColor(loyaltyLevel)} text-white font-semibold`}>
            {getLoyaltyLevelName(loyaltyLevel)} Level {loyaltyLevel}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Level Benefits</p>
            <p className="text-white font-medium">
              {loyaltyLevel >= 8 ? 'Priority access, VIP support' :
               loyaltyLevel >= 6 ? 'Enhanced APY, early access' :
               loyaltyLevel >= 4 ? 'Bonus rewards, priority queue' :
               loyaltyLevel >= 2 ? 'Standard benefits' : 'Basic access'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Next Level</p>
            <p className="text-white font-medium">
              {loyaltyLevel < 10 ? `Need ${(loyaltyLevel * 100) - (userInfo?.loyaltyScore || 0)} more points` : 'Max level reached'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Progress</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getLoyaltyLevelColor(loyaltyLevel)}`}
                style={{ width: `${Math.min(((userInfo?.loyaltyScore || 0) % 100) / 100 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking History */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Staking History</h3>
        
        {stakingHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No staking history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stakingHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getActionIcon(transaction.action)}</span>
                  <div>
                    <p className={`font-medium ${getActionColor(transaction.action)} capitalize`}>
                      {transaction.action}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{transaction.amount} SOL</p>
                  <p className="text-gray-400 text-sm">Tier {transaction.tier}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={fetchUserData}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};
