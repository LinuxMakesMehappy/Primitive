import React from 'react';
import { useRealTimeMetrics, useJupiterMetrics, useFundMetrics, realTimeMetricsService } from '../services/real-time-metrics';

export const EnhancedProtocolMetrics: React.FC = () => {
  const { metrics: protocolMetrics, isConnected: protocolConnected } = useRealTimeMetrics();
  const { jupiterMetrics, isConnected: jupiterConnected } = useJupiterMetrics();
  const { fundMetrics, isConnected: fundConnected } = useFundMetrics();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(2) + '%';
  };

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getMarketTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.1) return 'text-green-400';
    if (risk < 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 0.1) return 'Low';
    if (risk < 0.2) return 'Medium';
    return 'High';
  };

  if (!protocolMetrics || !jupiterMetrics || fundMetrics.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Protocol Metrics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Protocol Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${protocolConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">
                {protocolConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getMarketTrendColor(protocolMetrics.marketTrend)}`}>
                {getMarketTrendIcon(protocolMetrics.marketTrend)}
              </span>
              <span className={`text-sm font-medium ${getMarketTrendColor(protocolMetrics.marketTrend)}`}>
                {protocolMetrics.marketTrend.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Value Locked</p>
                <p className="text-2xl font-bold text-white">{formatNumber(protocolMetrics.totalValueLocked)} SOL</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Staked</p>
                <p className="text-2xl font-bold text-white">{formatNumber(protocolMetrics.totalStaked)} SOL</p>
              </div>
              <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Yield</p>
                <p className="text-2xl font-bold text-white">{formatNumber(protocolMetrics.totalYield)} SOL</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Average APY</p>
                <p className="text-2xl font-bold text-white">{protocolMetrics.averageAPY.toFixed(2)}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Active Users</p>
            <p className="text-lg font-semibold text-white">{formatNumber(protocolMetrics.userCount)}</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Fund Utilization</p>
            <p className="text-lg font-semibold text-white">{formatPercentage(protocolMetrics.fundUtilization)}</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Risk Score</p>
            <p className={`text-lg font-semibold ${getRiskColor(protocolMetrics.riskScore)}`}>
              {getRiskLevel(protocolMetrics.riskScore)}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Active Strategies</p>
            <p className="text-lg font-semibold text-white">{protocolMetrics.activeStrategies}</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Last updated: {protocolMetrics.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Jupiter Integration Metrics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Jupiter Integration</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${jupiterConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">
              {jupiterConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Jupiter TVL</p>
                <p className="text-xl font-bold text-white">{formatNumber(jupiterMetrics.totalValueLocked)} SOL</p>
              </div>
              <div className="w-8 h-8 bg-indigo-600/30 rounded-lg flex items-center justify-center">
                <span className="text-indigo-400 text-sm">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Jupiter APY</p>
                <p className="text-xl font-bold text-white">{jupiterMetrics.averageAPY.toFixed(2)}%</p>
              </div>
              <div className="w-8 h-8 bg-emerald-600/30 rounded-lg flex items-center justify-center">
                <span className="text-emerald-400 text-sm">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Yield Opportunities</p>
                <p className="text-xl font-bold text-white">{jupiterMetrics.yieldOpportunities}</p>
              </div>
              <div className="w-8 h-8 bg-amber-600/30 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 text-sm">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Liquidity Depth</p>
            <p className="text-lg font-semibold text-white">{formatPercentage(jupiterMetrics.liquidityDepth)}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Price Impact</p>
            <p className="text-lg font-semibold text-white">{formatPercentage(jupiterMetrics.priceImpact)}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-300 text-sm">Last Updated</p>
            <p className="text-lg font-semibold text-white">{jupiterMetrics.lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => realTimeMetricsService.refreshJupiterData()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Jupiter Data</span>
          </button>
        </div>
      </div>

      {/* Fund Metrics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Fund Performance</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${fundConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">
              {fundConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {fundMetrics.map((fund) => (
            <div key={fund.fundId} className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Fund #{fund.fundId}</h3>
                <div className="text-sm text-gray-400">
                  {fund.lastUpdated.toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-300 text-sm">Total Staked</p>
                  <p className="text-lg font-bold text-white">{formatNumber(fund.totalStaked)} SOL</p>
                </div>
                
                <div>
                  <p className="text-gray-300 text-sm">Users</p>
                  <p className="text-lg font-bold text-white">{formatNumber(fund.userCount)}</p>
                </div>
                
                <div>
                  <p className="text-gray-300 text-sm">APY</p>
                  <p className="text-lg font-bold text-white">{fund.averageAPY.toFixed(2)}%</p>
                </div>
                
                <div>
                  <p className="text-gray-300 text-sm">Utilization</p>
                  <p className="text-lg font-bold text-white">{formatPercentage(fund.utilization)}</p>
                </div>
              </div>

              {/* Tier Distribution */}
              <div className="mt-4">
                <p className="text-gray-300 text-sm mb-2">Tier Distribution</p>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-green-600/20 rounded-lg p-2 text-center">
                    <p className="text-green-400 text-sm font-medium">Tier 1</p>
                    <p className="text-white text-lg font-bold">{formatPercentage(fund.tierDistribution.tier1)}</p>
                  </div>
                  <div className="flex-1 bg-blue-600/20 rounded-lg p-2 text-center">
                    <p className="text-blue-400 text-sm font-medium">Tier 2</p>
                    <p className="text-white text-lg font-bold">{formatPercentage(fund.tierDistribution.tier2)}</p>
                  </div>
                  <div className="flex-1 bg-purple-600/20 rounded-lg p-2 text-center">
                    <p className="text-purple-400 text-sm font-medium">Tier 3</p>
                    <p className="text-white text-lg font-bold">{formatPercentage(fund.tierDistribution.tier3)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
