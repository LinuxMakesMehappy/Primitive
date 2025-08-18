import React from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { EventEmitter } from 'events';
import { fallbackRPCConnection } from './rpc-fallback';

export interface WalletMetrics {
  solBalance: number;
  tokenBalances: TokenBalance[];
  totalTokenValue: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  stakingInfo: StakingInfo;
  lastUpdated: Date;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  value: number; // USD value if available
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'other';
  amount: number;
  fee: number;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface StakingInfo {
  totalStaked: number;
  stakingAccounts: StakingAccount[];
  rewards: number;
  apy: number;
}

export interface StakingAccount {
  account: string;
  amount: number;
  startDate: number;
  rewards: number;
}

class RealWalletMetricsService extends EventEmitter {
  private walletPubkey: string | null = null;
  private interval: NodeJS.Timeout | null = null;
  private walletMetrics: WalletMetrics | null = null;
  private isConnected = false;

  constructor() {
    super();
  }

  public connect(walletPubkey: string) {
    this.walletPubkey = walletPubkey;
    this.isConnected = true;
    this.startPolling();
    this.fetchWalletMetrics();
  }

  public disconnect() {
    this.walletPubkey = null;
    this.isConnected = false;
    this.stopPolling();
    this.walletMetrics = null;
    this.emit('disconnected');
  }

  private startPolling() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      if (this.isConnected && this.walletPubkey) {
        this.fetchWalletMetrics();
      }
    }, 5000); // Update every 5 seconds
  }

  private stopPolling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async fetchWalletMetrics() {
    if (!this.walletPubkey) return;

    try {
      const pubkey = new PublicKey(this.walletPubkey);
      
      // Fetch SOL balance with fallback RPC
      let solBalance = 0;
      try {
        solBalance = await fallbackRPCConnection.getBalance(pubkey);
      } catch (error) {
        console.warn('Failed to fetch SOL balance, using fallback:', error);
        solBalance = 0;
      }
      
      // Fetch token accounts with fallback RPC
      let tokenAccounts = { value: [] };
      try {
        tokenAccounts = await fallbackRPCConnection.getParsedTokenAccountsByOwner(
          pubkey,
          { programId: TOKEN_PROGRAM_ID }
        );
      } catch (error) {
        console.warn('Failed to fetch token accounts:', error);
      }

      // Fetch recent transactions with fallback RPC
      let signatures = [];
      try {
        signatures = await fallbackRPCConnection.getSignaturesForAddress(
          pubkey,
          { limit: 10 }
        );
      } catch (error) {
        console.warn('Failed to fetch transaction signatures:', error);
      }

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await fallbackRPCConnection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });
            
            return {
              signature: sig.signature,
              timestamp: sig.blockTime || 0,
              type: this.determineTransactionType(tx),
              amount: this.extractTransactionAmount(tx),
              fee: tx?.meta?.fee || 0,
              status: 'confirmed' as const,
            };
          } catch (error) {
            return {
              signature: sig.signature,
              timestamp: sig.blockTime || 0,
              type: 'other' as const,
              amount: 0,
              fee: 0,
              status: 'confirmed' as const,
            };
          }
        })
      );

      // Process token balances
      const tokenBalances: TokenBalance[] = tokenAccounts.value
        .map((account) => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            symbol: this.getTokenSymbol(parsedInfo.mint),
            name: this.getTokenName(parsedInfo.mint),
            balance: parsedInfo.tokenAmount.uiAmount || 0,
            decimals: parsedInfo.tokenAmount.decimals,
            value: this.estimateTokenValue(parsedInfo.mint, parsedInfo.tokenAmount.uiAmount || 0),
          };
        })
        .filter((token) => token.balance > 0);

      // Calculate total token value
      const totalTokenValue = tokenBalances.reduce((sum, token) => sum + token.value, 0);

      // Mock staking info (in real implementation, this would fetch from staking programs)
      const stakingInfo: StakingInfo = {
        totalStaked: 0, // Would fetch from staking programs
        stakingAccounts: [],
        rewards: 0,
        apy: 0,
      };

      this.walletMetrics = {
        solBalance: solBalance / LAMPORTS_PER_SOL,
        tokenBalances,
        totalTokenValue,
        transactionCount: signatures.length,
        recentTransactions: transactions,
        stakingInfo,
        lastUpdated: new Date(),
      };

      this.emit('metricsUpdated', this.walletMetrics);
    } catch (error) {
      console.error('Failed to fetch wallet metrics:', error);
      // Emit error but don't crash the service
      this.emit('error', error);
    }
  }

  private determineTransactionType(tx: any): Transaction['type'] {
    if (!tx?.meta) return 'other';
    
    // Simple heuristics to determine transaction type
    const instructions = tx.transaction.message.instructions;
    
    for (const ix of instructions) {
      if (ix.programId === TOKEN_PROGRAM_ID.toBase58()) {
        return 'swap';
      }
      // Add more program ID checks for staking, etc.
    }
    
    return 'other';
  }

  private extractTransactionAmount(tx: any): number {
    if (!tx?.meta) return 0;
    
    // Extract SOL amount from transaction
    const preBalances = tx.meta.preBalances;
    const postBalances = tx.meta.postBalances;
    
    if (preBalances && postBalances && preBalances.length > 0 && postBalances.length > 0) {
      const balanceChange = (postBalances[0] - preBalances[0]) / LAMPORTS_PER_SOL;
      return Math.abs(balanceChange);
    }
    
    return 0;
  }

  private getTokenSymbol(mint: string): string {
    // Common token symbols mapping
    const tokenSymbols: { [key: string]: string } = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'So11111111111111111111111111111111111111112': 'SOL',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    };
    
    return tokenSymbols[mint] || 'Unknown';
  }

  private getTokenName(mint: string): string {
    // Common token names mapping
    const tokenNames: { [key: string]: string } = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USD Coin',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'Tether USD',
      'So11111111111111111111111111111111111111112': 'Solana',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'Marinade Staked SOL',
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'Lido Staked SOL',
    };
    
    return tokenNames[mint] || 'Unknown Token';
  }

  private estimateTokenValue(mint: string, balance: number): number {
    // Mock USD values for common tokens
    const tokenPrices: { [key: string]: number } = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.00, // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1.00, // USDT
      'So11111111111111111111111111111111111111112': 100.00, // SOL (mock price)
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 100.00, // mSOL
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 100.00, // stSOL
    };
    
    return balance * (tokenPrices[mint] || 0);
  }

  public getWalletMetrics(): WalletMetrics | null {
    return this.walletMetrics;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async refreshMetrics() {
    if (this.walletPubkey) {
      await this.fetchWalletMetrics();
    }
  }
}

export const realWalletMetricsService = new RealWalletMetricsService();

// React hook for components
export const useRealWalletMetrics = (walletPubkey: string | null) => {
  const [metrics, setMetrics] = React.useState<WalletMetrics | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (walletPubkey) {
      realWalletMetricsService.connect(walletPubkey);
      setIsConnected(true);
    } else {
      realWalletMetricsService.disconnect();
      setIsConnected(false);
      setMetrics(null);
    }

    const handleMetricsUpdate = (newMetrics: WalletMetrics) => {
      setMetrics(newMetrics);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setMetrics(null);
    };

    realWalletMetricsService.on('metricsUpdated', handleMetricsUpdate);
    realWalletMetricsService.on('disconnected', handleDisconnect);

    return () => {
      realWalletMetricsService.off('metricsUpdated', handleMetricsUpdate);
      realWalletMetricsService.off('disconnected', handleDisconnect);
    };
  }, [walletPubkey]);

  return { metrics, isConnected };
};
