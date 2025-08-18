import React, { useState, useEffect } from 'react';
import { ProtocolClient } from '../services/protocol-client';

interface ProtocolMetricsProps {
  protocolClient: ProtocolClient | null;
}

export const ProtocolMetrics: React.FC<ProtocolMetricsProps> = ({ protocolClient }) => {
  const [metrics, setMetrics] = useState({
    totalStaked: 0,
    totalYield: 0,
    currentFundId: 0,
    isActive: false,
    tvl: 0,
    averageAPY: 0,
    activeStrategies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (protocolClient) {
      fetchMetrics();
    }
  }, [protocolClient]);

  const fetchMetrics = async () => {
    if (!protocolClient) return;

    try {
      setLoading(true);
      const [protocolInfo, jupiterMetrics] = await Promise.all([
        protocolClient.getProtocolInfo(),
        protocolClient.getProtocolMetrics(),
      ]);

      setMetrics({
        totalStaked: protocolInfo.totalStaked / 1e9, // Convert lamports to SOL
        totalYield: protocolInfo.totalYield / 1e9,
        currentFundId: protocolInfo.currentFundId,
        isActive: protocolInfo.isActive,
        tvl: jupiterMetrics.totalValueLocked,
        averageAPY: jupiterMetrics.averageAPY,
        activeStrategies: jupiterMetrics.activeStrategies,
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Protocol Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Value Locked */}
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Value Locked</p>
              <p className="text-2xl font-bold text-white">{formatNumber(metrics.tvl)} SOL</p>
            </div>
            <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Staked */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Staked</p>
              <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalStaked)} SOL</p>
            </div>
            <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Yield Generated */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Yield</p>
              <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalYield)} SOL</p>
            </div>
            <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average APY */}
        <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Average APY</p>
              <p className="text-2xl font-bold text-white">{metrics.averageAPY.toFixed(2)}%</p>
            </div>
            <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-300 text-sm">Current Fund ID</p>
          <p className="text-lg font-semibold text-white">#{metrics.currentFundId}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-300 text-sm">Active Strategies</p>
          <p className="text-lg font-semibold text-white">{metrics.activeStrategies}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-300 text-sm">Protocol Status</p>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${metrics.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <p className="text-lg font-semibold text-white">
              {metrics.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end relative z-10">
        <button
          onClick={fetchMetrics}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
