import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRealWalletMetrics, realWalletMetricsService } from '../services/real-wallet-metrics';

export const RealWalletMetrics: React.FC = () => {
  const { publicKey } = useWallet();
  const { metrics, isConnected } = useRealWalletMetrics(publicKey?.toString() || null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(4);
  };

  const formatUSD = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return '↗️';
      case 'receive':
        return '↘️';
      case 'swap':
        return '🔄';
      case 'stake':
        return '🔒';
      case 'unstake':
        return '🔓';
      default:
        return '📄';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'text-red-400';
      case 'receive':
        return 'text-green-400';
      case 'swap':
        return 'text-blue-400';
      case 'stake':
        return 'text-purple-400';
      case 'unstake':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Wallet Metrics</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-sm text-gray-300">Disconnected</span>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-400">Connect your wallet to view real-time metrics</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Wallet Metrics</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="text-sm text-gray-300">Loading...</span>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-6 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Wallet Metrics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => realWalletMetricsService.refreshMetrics()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-lg">◎</span>
            </div>
            <div>
              <p className="text-gray-300 text-sm">SOL Balance</p>
              <p className="text-xl font-bold text-white">{formatNumber(metrics.solBalance)} SOL</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-lg">💰</span>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Token Value</p>
              <p className="text-xl font-bold text-white">{formatUSD(metrics.totalTokenValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-lg">📊</span>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Transactions</p>
              <p className="text-xl font-bold text-white">{metrics.transactionCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-lg">🔒</span>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Staked</p>
              <p className="text-xl font-bold text-white">{formatNumber(metrics.stakingInfo.totalStaked)} SOL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      {metrics.tokenBalances.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Token Balances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.tokenBalances.map((token, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{token.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{token.symbol}</p>
                      <p className="text-gray-400 text-xs">{token.name}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold">{formatNumber(token.balance)}</p>
                  <p className="text-gray-400 text-sm">{formatUSD(token.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {metrics.recentTransactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {metrics.recentTransactions.map((tx, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                    <div>
                      <p className={`font-semibold capitalize ${getTransactionColor(tx.type)}`}>
                        {tx.type}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {tx.amount > 0 ? `${formatNumber(tx.amount)} SOL` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{formatDate(tx.timestamp)}</p>
                    <p className="text-gray-500 text-xs">
                      Fee: {tx.fee / 1000000} SOL
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs font-mono break-all">
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Last updated: {metrics.lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
