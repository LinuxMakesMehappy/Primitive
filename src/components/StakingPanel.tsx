import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ProtocolClient, StakingInfo } from '../services/protocol-client';
import { useRealTimeUserWallet } from '../services/real-time-user-wallet';

interface StakingPanelProps {
  protocolClient: ProtocolClient | null;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({ protocolClient }) => {
  const { publicKey } = useWallet();
  const { userData, isConnected, stake, unstake, claimYield } = useRealTimeUserWallet(publicKey?.toString() || null);
  const [tierRequirements, setTierRequirements] = useState({
    tier1: { minStake: 1000, apy: 15.0 },
    tier2: { minStake: 5000, apy: 18.0 },
    tier3: { minStake: 10000, apy: 22.0 },
  });
  const [stakingAmount, setStakingAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'stake' | 'unstake' | 'claim'>('stake');

  useEffect(() => {
    if (protocolClient) {
      fetchTierRequirements();
    }
  }, [protocolClient]);

  const fetchUserInfo = async () => {
    if (!protocolClient || !publicKey) return;

    try {
      const info = await protocolClient.getUserInfo(publicKey);
      setUserInfo(info);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const fetchTierRequirements = async () => {
    if (!protocolClient) return;

    try {
      const requirements = await protocolClient.getTierRequirements();
      setTierRequirements(requirements);
    } catch (error) {
      console.error('Failed to fetch tier requirements:', error);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !stakingAmount) return;

    try {
      setLoading(true);
      const amount = parseFloat(stakingAmount);
      await stake(amount);
      setStakingAmount('');
    } catch (error) {
      console.error('Failed to stake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!publicKey || !stakingAmount) return;

    try {
      setLoading(true);
      const amount = parseFloat(stakingAmount);
      await unstake(amount);
      setStakingAmount('');
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

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-green-500 to-emerald-500';
      case 2: return 'from-blue-500 to-cyan-500';
      case 3: return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Staking Panel</h2>

      {/* User Info */}
      {userData && (
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Your Position</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-300 text-sm">Current Stake</p>
              <p className="text-lg font-bold text-white">{userData.currentStake.toFixed(2)} SOL</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Tier</p>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getTierColor(userData.currentTier)}`}></div>
                <p className="text-lg font-bold text-white">Tier {userData.currentTier}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Loyalty Score</p>
              <p className="text-lg font-bold text-white">{userData.loyaltyScore.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Pending Yield</p>
              <p className="text-lg font-bold text-white">{userData.pendingYield.toFixed(4)} SOL</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {[
          { key: 'stake', label: 'Stake', icon: '⬆️' },
          { key: 'unstake', label: 'Unstake', icon: '⬇️' },
          { key: 'claim', label: 'Claim Yield', icon: '💰' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAction(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              action === tab.key
                ? 'bg-white/20 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Panel */}
      {action === 'stake' && (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Select Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTier === tier
                      ? `border-white/50 bg-gradient-to-r ${getTierColor(tier)}/20`
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Tier {tier}</p>
                    <p className="text-sm text-gray-300">{tierRequirements[`tier${tier}` as keyof typeof tierRequirements].apy}% APY</p>
                    <p className="text-xs text-gray-400">
                      Min: {tierRequirements[`tier${tier}` as keyof typeof tierRequirements].minStake} SOL
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount to Stake (SOL)
            </label>
            <input
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount((e.target as HTMLInputElement).value)}
              placeholder="Enter amount"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleStake}
            disabled={loading || !stakingAmount}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Stake Tokens'}
          </button>
        </div>
      )}

      {action === 'unstake' && (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount to Unstake (SOL)
            </label>
            <input
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount((e.target as HTMLInputElement).value)}
              placeholder="Enter amount"
              max={userInfo?.currentStake || 0}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {userInfo && (
              <p className="text-sm text-gray-400 mt-1">
                Available: {userInfo.currentStake.toFixed(2)} SOL
              </p>
            )}
          </div>

          <button
            onClick={handleUnstake}
            disabled={loading || !stakingAmount || !userInfo?.isActive}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Unstake Tokens'}
          </button>
        </div>
      )}

      {action === 'claim' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
            <p className="text-white font-medium">Claim Your Yield Rewards</p>
            <p className="text-gray-300 text-sm mt-1">
              Claim accumulated yield from your staked position
            </p>
          </div>

          <button
            onClick={handleClaimYield}
            disabled={loading || !userInfo?.isActive}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Claim Yield'}
          </button>
        </div>
      )}

      {/* Tier Information */}
      <div className="mt-6 bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Tier Information</h4>
        <div className="space-y-2">
          {[1, 2, 3].map((tier) => (
            <div key={tier} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTierColor(tier)}`}></div>
                <span className="text-gray-300">Tier {tier}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{tierRequirements[`tier${tier}` as keyof typeof tierRequirements].apy}% APY</span>
                <span className="text-gray-400 text-sm ml-2">
                  ({tierRequirements[`tier${tier}` as keyof typeof tierRequirements].minStake} SOL min)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
