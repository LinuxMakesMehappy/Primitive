import { EventEmitter } from 'events';
import React from 'react';
import { PublicKey } from '@solana/web3.js';

export interface UserWalletData {
  publicKey: string;
  currentStake: number;
  totalStaked: number;
  totalYield: number;
  currentTier: number;
  loyaltyScore: number;
  stakedAt: Date;
  lastClaim: Date;
  pendingYield: number;
  tierProgress: number;
  nextTierThreshold: number;
  lastUpdated: Date;
}

export interface UserStakingHistory {
  id: string;
  action: 'stake' | 'unstake' | 'claim';
  amount: number;
  timestamp: Date;
  tier: number;
  txHash: string;
  blockTime: number;
}

class RealTimeUserWalletService extends EventEmitter {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private userData: Map<string, UserWalletData> = new Map();
  private stakingHistory: Map<string, UserStakingHistory[]> = new Map();

  constructor() {
    super();
  }

  startTrackingUser(publicKey: string) {
    if (this.intervals.has(publicKey)) return;

    // Initialize user data if not exists
    if (!this.userData.has(publicKey)) {
      this.initializeUserData(publicKey);
    }

    // Start real-time updates for this user
    const interval = setInterval(() => {
      this.updateUserData(publicKey);
    }, 2000); // Update every 2 seconds

    this.intervals.set(publicKey, interval);
    
    // Emit initial data
    const userData = this.userData.get(publicKey);
    if (userData) {
      this.emit(`userData:${publicKey}`, userData);
    }
  }

  stopTrackingUser(publicKey: string) {
    const interval = this.intervals.get(publicKey);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(publicKey);
    }
  }

  private initializeUserData(publicKey: string) {
    const baseStake = 1000 + Math.random() * 5000; // Random initial stake
    const loyaltyScore = Math.floor(Math.random() * 500) + 100; // Random loyalty score
    const tier = Math.min(Math.floor(loyaltyScore / 100) + 1, 3);
    
    const userData: UserWalletData = {
      publicKey,
      currentStake: baseStake,
      totalStaked: baseStake,
      totalYield: baseStake * 0.05, // 5% initial yield
      currentTier: tier,
      loyaltyScore,
      stakedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random staking date
      lastClaim: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last claim
      pendingYield: baseStake * 0.02, // 2% pending yield
      tierProgress: loyaltyScore % 100,
      nextTierThreshold: tier < 3 ? tier * 100 : 0,
      lastUpdated: new Date(),
    };

    this.userData.set(publicKey, userData);

    // Initialize staking history
    this.initializeStakingHistory(publicKey, userData);
  }

  private initializeStakingHistory(publicKey: string, userData: UserWalletData) {
    const history: UserStakingHistory[] = [];
    const now = Date.now();
    
    // Add initial stake
    history.push({
      id: '1',
      action: 'stake',
      amount: userData.currentStake,
      timestamp: userData.stakedAt,
      tier: userData.currentTier,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
      blockTime: Math.floor(userData.stakedAt.getTime() / 1000),
    });

    // Add some yield claims
    for (let i = 2; i <= 5; i++) {
      const claimAmount = userData.currentStake * (0.01 + Math.random() * 0.02);
      const claimTime = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      history.push({
        id: i.toString(),
        action: 'claim',
        amount: claimAmount,
        timestamp: claimTime,
        tier: userData.currentTier,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
        blockTime: Math.floor(claimTime.getTime() / 1000),
      });
    }

    this.stakingHistory.set(publicKey, history);
  }

  private updateUserData(publicKey: string) {
    const userData = this.userData.get(publicKey);
    if (!userData) return;

    // Simulate yield accumulation
    const yieldRate = 0.15 / 365 / 24 / 60 / 60; // 15% APY per second
    const yieldIncrease = userData.currentStake * yieldRate * 2; // 2 seconds
    userData.pendingYield += yieldIncrease;
    userData.totalYield += yieldIncrease * 0.1; // 10% goes to total yield

    // Update loyalty score based on staking time and amount
    const timeStaked = (Date.now() - userData.stakedAt.getTime()) / (1000 * 60 * 60 * 24); // Days
    const loyaltyIncrease = (timeStaked * 0.1) + (userData.currentStake / 1000 * 0.01);
    userData.loyaltyScore += loyaltyIncrease;

    // Update tier if threshold reached
    const newTier = Math.min(Math.floor(userData.loyaltyScore / 100) + 1, 3);
    if (newTier > userData.currentTier) {
      userData.currentTier = newTier;
      userData.tierProgress = 0;
      userData.nextTierThreshold = newTier < 3 ? newTier * 100 : 0;
      
      // Emit tier upgrade event
      this.emit(`tierUpgrade:${publicKey}`, {
        oldTier: newTier - 1,
        newTier,
        timestamp: new Date(),
      });
    } else {
      userData.tierProgress = userData.loyaltyScore % 100;
    }

    // Occasionally add new staking history entries
    if (Math.random() < 0.05) { // 5% chance every 2 seconds
      this.addStakingHistoryEntry(publicKey, userData);
    }

    // Update timestamp
    userData.lastUpdated = new Date();

    // Emit updated data
    this.emit(`userData:${publicKey}`, { ...userData });
  }

  private addStakingHistoryEntry(publicKey: string, userData: UserWalletData) {
    const history = this.stakingHistory.get(publicKey) || [];
    const actions: ('stake' | 'unstake' | 'claim')[] = ['claim'];
    
    // Occasionally add stake/unstake actions
    if (Math.random() < 0.1) {
      actions.push('stake');
    }
    if (Math.random() < 0.05) {
      actions.push('unstake');
    }

    const action = actions[Math.floor(Math.random() * actions.length)];
    let amount = 0;

    switch (action) {
      case 'stake':
        amount = 100 + Math.random() * 500;
        userData.currentStake += amount;
        userData.totalStaked += amount;
        break;
      case 'unstake':
        amount = Math.min(50 + Math.random() * 200, userData.currentStake * 0.1);
        userData.currentStake -= amount;
        break;
      case 'claim':
        amount = userData.pendingYield * (0.1 + Math.random() * 0.3);
        userData.pendingYield -= amount;
        userData.lastClaim = new Date();
        break;
    }

    const newEntry: UserStakingHistory = {
      id: (history.length + 1).toString(),
      action,
      amount,
      timestamp: new Date(),
      tier: userData.currentTier,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
      blockTime: Math.floor(Date.now() / 1000),
    };

    history.unshift(newEntry); // Add to beginning
    if (history.length > 20) {
      history.pop(); // Keep only last 20 entries
    }

    this.stakingHistory.set(publicKey, history);
  }

  getUserData(publicKey: string): UserWalletData | null {
    return this.userData.get(publicKey) || null;
  }

  getStakingHistory(publicKey: string): UserStakingHistory[] {
    return this.stakingHistory.get(publicKey) || [];
  }

  // Simulate user actions
  async stake(publicKey: string, amount: number): Promise<boolean> {
    const userData = this.userData.get(publicKey);
    if (!userData) return false;

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    userData.currentStake += amount;
    userData.totalStaked += amount;
    userData.lastUpdated = new Date();

    // Add to history
    this.addStakingHistoryEntry(publicKey, userData);

    this.emit(`userData:${publicKey}`, { ...userData });
    return true;
  }

  async unstake(publicKey: string, amount: number): Promise<boolean> {
    const userData = this.userData.get(publicKey);
    if (!userData || userData.currentStake < amount) return false;

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    userData.currentStake -= amount;
    userData.lastUpdated = new Date();

    // Add to history
    this.addStakingHistoryEntry(publicKey, userData);

    this.emit(`userData:${publicKey}`, { ...userData });
    return true;
  }

  async claimYield(publicKey: string): Promise<boolean> {
    const userData = this.userData.get(publicKey);
    if (!userData || userData.pendingYield <= 0) return false;

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const claimedAmount = userData.pendingYield;
    userData.pendingYield = 0;
    userData.totalYield += claimedAmount;
    userData.lastClaim = new Date();
    userData.lastUpdated = new Date();

    // Add to history
    this.addStakingHistoryEntry(publicKey, userData);

    this.emit(`userData:${publicKey}`, { ...userData });
    return true;
  }

  // Cleanup when user disconnects
  cleanup() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.userData.clear();
    this.stakingHistory.clear();
  }
}

// Create singleton instance
export const realTimeUserWalletService = new RealTimeUserWalletService();

// React hook for using real-time user wallet data
export const useRealTimeUserWallet = (publicKey: string | null) => {
  const [userData, setUserData] = React.useState<UserWalletData | null>(null);
  const [stakingHistory, setStakingHistory] = React.useState<UserStakingHistory[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastTierUpgrade, setLastTierUpgrade] = React.useState<{
    oldTier: number;
    newTier: number;
    timestamp: Date;
  } | null>(null);

  React.useEffect(() => {
    if (!publicKey) {
      setUserData(null);
      setStakingHistory([]);
      setIsConnected(false);
      return;
    }

    const pubKeyString = publicKey.toString();

    const handleUserData = (data: UserWalletData) => {
      setUserData(data);
      setIsConnected(true);
    };

    const handleTierUpgrade = (upgrade: { oldTier: number; newTier: number; timestamp: Date }) => {
      setLastTierUpgrade(upgrade);
      // Clear the upgrade notification after 5 seconds
      setTimeout(() => setLastTierUpgrade(null), 5000);
    };

    // Start tracking user
    realTimeUserWalletService.startTrackingUser(pubKeyString);
    
    // Subscribe to updates
    realTimeUserWalletService.on(`userData:${pubKeyString}`, handleUserData);
    realTimeUserWalletService.on(`tierUpgrade:${pubKeyString}`, handleTierUpgrade);
    
    // Get initial data
    const initialData = realTimeUserWalletService.getUserData(pubKeyString);
    const initialHistory = realTimeUserWalletService.getStakingHistory(pubKeyString);
    
    if (initialData) {
      setUserData(initialData);
      setIsConnected(true);
    }
    setStakingHistory(initialHistory);

    return () => {
      realTimeUserWalletService.off(`userData:${pubKeyString}`, handleUserData);
      realTimeUserWalletService.off(`tierUpgrade:${pubKeyString}`, handleTierUpgrade);
      realTimeUserWalletService.stopTrackingUser(pubKeyString);
    };
  }, [publicKey]);

  return {
    userData,
    stakingHistory,
    isConnected,
    lastTierUpgrade,
    stake: (amount: number) => publicKey ? realTimeUserWalletService.stake(publicKey.toString(), amount) : Promise.resolve(false),
    unstake: (amount: number) => publicKey ? realTimeUserWalletService.unstake(publicKey.toString(), amount) : Promise.resolve(false),
    claimYield: () => publicKey ? realTimeUserWalletService.claimYield(publicKey.toString()) : Promise.resolve(false),
  };
};
