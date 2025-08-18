import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ProtocolClient, StakingInfo } from '../services/protocol-client';
import { useRealTimeUserWallet } from '../services/real-time-user-wallet';

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
  const { 
    userData, 
    stakingHistory, 
    isConnected, 
    lastTierUpgrade,
    stake,
    unstake,
    claimYield 
  } = useRealTimeUserWallet(publicKey?.toString() || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  const handleStake = async (amount: number) => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      await stake(amount);
    } catch (error) {
      console.error('Failed to stake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (amount: number) => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      await unstake(amount);
    } catch (error) {
      console.error('Failed to unstake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimYield = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      await claimYield();
    } catch (error) {
      console.error('Failed to claim yield:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoyaltyLevelColor = (score: number) => {
    const level = Math.min(Math.floor(score / 100) + 1, 10);
    if (level >= 8) return 'from-purple-500 to-pink-500';
    if (level >= 6) return 'from-blue-500 to-cyan-500';
    if (level >= 4) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-gray-600';
  };

  const getLoyaltyLevelName = (score: number) => {
    const level = Math.min(Math.floor(score / 100) + 1, 10);
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

  if (loading || !userData) {
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-300">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Tier Upgrade Notification */}
      {lastTierUpgrade && (
        <div className="mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🎉</div>
            <div>
              <p className="text-white font-semibold">Tier Upgrade!</p>
              <p className="text-gray-300 text-sm">
                Congratulations! You've been upgraded from Tier {lastTierUpgrade.oldTier} to Tier {lastTierUpgrade.newTier}
              </p>
            </div>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Current Stake</p>
              <p className="text-2xl font-bold text-white">{userData.currentStake.toFixed(2)} SOL</p>
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
              <p className="text-2xl font-bold text-white">Tier {userData.currentTier}</p>
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
              <p className="text-2xl font-bold text-white">{userData.loyaltyScore.toFixed(0)}</p>
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
              <p className="text-gray-300 text-sm">Pending Yield</p>
              <p className="text-2xl font-bold text-white">{userData.pendingYield.toFixed(4)} SOL</p>
            </div>
            <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Level */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Loyalty Level</h3>
            <p className="text-gray-300">Your current loyalty status and benefits</p>
          </div>
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getLoyaltyLevelColor(userData.loyaltyScore)} text-white font-semibold`}>
            {getLoyaltyLevelName(userData.loyaltyScore)} Level {Math.min(Math.floor(userData.loyaltyScore / 100) + 1, 10)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Tier Benefits</p>
            <p className="text-white font-medium">
              {userData.currentTier === 3 ? 'Maximum APY, VIP support' :
               userData.currentTier === 2 ? 'Enhanced APY, early access' :
               'Standard benefits, basic access'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Next Tier</p>
            <p className="text-white font-medium">
              {userData.currentTier < 3 ? `Need ${userData.nextTierThreshold - userData.loyaltyScore} more points` : 'Max tier reached'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-gray-300 text-sm">Progress</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getLoyaltyLevelColor(userData.loyaltyScore)}`}
                style={{ width: `${userData.tierProgress}%` }}
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
                  <p className="text-white font-medium">{transaction.amount.toFixed(4)} SOL</p>
                  <p className="text-gray-400 text-sm">Tier {transaction.tier}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Last updated: {userData.lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3 relative z-10">
        <button
          onClick={() => handleClaimYield()}
          disabled={loading || userData.pendingYield <= 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span>{loading ? 'Claiming...' : `Claim ${userData.pendingYield.toFixed(4)} SOL`}</span>
        </button>
      </div>
    </div>
  );
};
