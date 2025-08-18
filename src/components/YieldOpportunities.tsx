import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ProtocolClient } from '../services/protocol-client';

interface YieldOpportunitiesProps {
  protocolClient: ProtocolClient | null;
}

interface YieldOpportunity {
  id: string;
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  apy: number;
  strategy: string;
  risk: 'low' | 'medium' | 'high';
}

export const YieldOpportunities: React.FC<YieldOpportunitiesProps> = ({ protocolClient }) => {
  const { publicKey } = useWallet();
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  useEffect(() => {
    if (protocolClient) {
      fetchYieldOpportunities();
    }
  }, [protocolClient]);

  const fetchYieldOpportunities = async () => {
    if (!protocolClient) return;

    try {
      setLoading(true);
      
      // Simulate fetching yield opportunities from Jupiter
      // In a real implementation, this would call protocolClient.getYieldOpportunities()
      const mockOpportunities: YieldOpportunity[] = [
        {
          id: '1',
          inAmount: 1000,
          outAmount: 1050,
          priceImpactPct: 0.5,
          apy: 12.5,
          strategy: 'SOL-USDC LP',
          risk: 'low',
        },
        {
          id: '2',
          inAmount: 1000,
          outAmount: 1080,
          priceImpactPct: 1.2,
          apy: 18.2,
          strategy: 'SOL-RAY LP',
          risk: 'medium',
        },
        {
          id: '3',
          inAmount: 1000,
          outAmount: 1120,
          priceImpactPct: 2.8,
          apy: 24.8,
          strategy: 'SOL-SRM LP',
          risk: 'high',
        },
        {
          id: '4',
          inAmount: 1000,
          outAmount: 1030,
          priceImpactPct: 0.3,
          apy: 8.9,
          strategy: 'SOL-mSOL Staking',
          risk: 'low',
        },
        {
          id: '5',
          inAmount: 1000,
          outAmount: 1090,
          priceImpactPct: 1.8,
          apy: 21.5,
          strategy: 'SOL-JUP LP',
          risk: 'medium',
        },
      ];

      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Failed to fetch yield opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeStrategy = async (opportunity: YieldOpportunity) => {
    if (!protocolClient || !publicKey) return;

    try {
      setLoading(true);
      console.log(`Executing strategy: ${opportunity.strategy}`);
      
      // Simulate strategy execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh opportunities
      await fetchYieldOpportunities();
    } catch (error) {
      console.error('Failed to execute strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-white">Yield Opportunities</h2>
        <button
          onClick={fetchYieldOpportunities}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Strategy Overview */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 mb-6 border border-purple-500/30">
        <h3 className="text-white font-semibold mb-2">Jupiter Yield Farming</h3>
        <p className="text-gray-300 text-sm">
          The protocol automatically farms yield on Jupiter by providing liquidity to various pools and executing optimal strategies.
        </p>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-semibold">{opportunity.strategy}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.risk)}`}>
                    {getRiskIcon(opportunity.risk)} {opportunity.risk.toUpperCase()} RISK
                  </span>
                  <span className="text-gray-400 text-sm">
                    {opportunity.priceImpactPct.toFixed(2)}% impact
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{opportunity.apy.toFixed(1)}%</p>
                <p className="text-gray-400 text-sm">APY</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-300 text-sm">Input Amount</p>
                <p className="text-white font-medium">{opportunity.inAmount.toLocaleString()} SOL</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Expected Output</p>
                <p className="text-white font-medium">{opportunity.outAmount.toLocaleString()} SOL</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => executeStrategy(opportunity)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? 'Executing...' : 'Execute Strategy'}
              </button>
              <button
                onClick={() => setSelectedStrategy(selectedStrategy === opportunity.id ? null : opportunity.id)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Details
              </button>
            </div>

            {/* Strategy Details */}
            {selectedStrategy === opportunity.id && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h5 className="text-white font-medium mb-2">Strategy Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Liquidity Pool</p>
                    <p className="text-white">{opportunity.strategy}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price Impact</p>
                    <p className="text-white">{opportunity.priceImpactPct.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Risk Level</p>
                    <p className="text-white capitalize">{opportunity.risk}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    This strategy provides liquidity to the {opportunity.strategy} pool on Jupiter, 
                    earning fees and yield rewards. The {opportunity.risk} risk level indicates 
                    the volatility and potential for impermanent loss.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-300 text-sm">Total Strategies</p>
            <p className="text-white font-bold">{opportunities.length}</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm">Avg APY</p>
            <p className="text-white font-bold">
              {(opportunities.reduce((sum, opp) => sum + opp.apy, 0) / opportunities.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm">Low Risk</p>
            <p className="text-white font-bold">
              {opportunities.filter(opp => opp.risk === 'low').length}
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm">High Yield</p>
            <p className="text-white font-bold">
              {opportunities.filter(opp => opp.apy > 15).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
