import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import { ProtocolClient } from '../services/protocol-client';
import { StakingPanel } from './StakingPanel';
import { ProtocolMetrics } from './ProtocolMetrics';
import { EnhancedProtocolMetrics } from './EnhancedProtocolMetrics';
import { RealWalletMetrics } from './RealWalletMetrics';
import { UserProfile } from './UserProfile';
import { YieldOpportunities } from './YieldOpportunities';
import { CustomWalletButton } from './CustomWalletButton';

require('@solana/wallet-adapter-react-ui/styles.css');

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const connection = new Connection('https://api.mainnet-beta.solana.com');

export const Dashboard: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [protocolClient, setProtocolClient] = useState<ProtocolClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (connected && publicKey) {
      initializeProtocolClient();
    }
  }, [connected, publicKey]);

  const initializeProtocolClient = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const client = new ProtocolClient({
        connection,
        wallet: { publicKey },
        programId: PROGRAM_ID,
      });

      await client.initialize();
      setProtocolClient(client);
    } catch (error) {
      console.error('Failed to initialize protocol client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Primitive Protocol</h1>
          <p className="text-gray-300 mb-8 text-lg">
            Connect your wallet to access the advanced staking protocol with Jupiter yield farming
          </p>
          <WalletMultiButton className="wallet-adapter-button" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Primitive Protocol</h1>
              <div className="hidden md:flex space-x-1">
                {['dashboard', 'staking', 'yield', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative z-50">
              <CustomWalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <EnhancedProtocolMetrics />
                <RealWalletMetrics />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <StakingPanel protocolClient={protocolClient} />
                  <YieldOpportunities protocolClient={protocolClient} />
                </div>
              </div>
            )}
            
            {activeTab === 'staking' && (
              <StakingPanel protocolClient={protocolClient} />
            )}
            
            {activeTab === 'yield' && (
              <YieldOpportunities protocolClient={protocolClient} />
            )}
            
            {activeTab === 'profile' && (
              <UserProfile protocolClient={protocolClient} />
            )}
          </>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20">
        <div className="flex justify-around py-2">
          {['dashboard', 'staking', 'yield', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xs font-medium">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
