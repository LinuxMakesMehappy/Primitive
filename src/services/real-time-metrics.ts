import { EventEmitter } from 'events';
import React from 'react';

export interface ProtocolMetrics {
  totalValueLocked: number;
  totalStaked: number;
  totalYield: number;
  averageAPY: number;
  currentFundId: number;
  activeStrategies: number;
  isActive: boolean;
  lastUpdated: Date;
  yieldRate: number;
  stakingGrowth: number;
  userCount: number;
  fundUtilization: number;
  riskScore: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
}

export interface JupiterMetrics {
  totalValueLocked: number;
  averageAPY: number;
  activeStrategies: number;
  yieldOpportunities: number;
  liquidityDepth: number;
  priceImpact: number;
  lastUpdated: Date;
}

export interface FundMetrics {
  fundId: number;
  totalStaked: number;
  userCount: number;
  averageAPY: number;
  utilization: number;
  tierDistribution: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  lastUpdated: Date;
}

class RealTimeMetricsService extends EventEmitter {
  private protocolInterval: NodeJS.Timeout | null = null;
  private jupiterInterval: NodeJS.Timeout | null = null;
  private fundInterval: NodeJS.Timeout | null = null;
  
  private protocolMetrics!: ProtocolMetrics;
  private jupiterMetrics!: JupiterMetrics;
  private fundMetrics: FundMetrics[] = [];

  constructor() {
    super();
    this.initializeMetrics();
    this.startRealTimeUpdates();
  }

  private initializeMetrics() {
    // Initialize protocol metrics with realistic starting values
    this.protocolMetrics = {
      totalValueLocked: 2500000 + Math.random() * 1000000, // 2.5M - 3.5M SOL
      totalStaked: 1800000 + Math.random() * 800000, // 1.8M - 2.6M SOL
      totalYield: 125000 + Math.random() * 75000, // 125K - 200K SOL
      averageAPY: 16.5 + Math.random() * 4, // 16.5% - 20.5%
      currentFundId: 1,
      activeStrategies: 3,
      isActive: true,
      lastUpdated: new Date(),
      yieldRate: 0.165,
      stakingGrowth: 0.08,
      userCount: 15000 + Math.floor(Math.random() * 5000),
      fundUtilization: 0.85 + Math.random() * 0.1,
      riskScore: 0.15 + Math.random() * 0.1,
      marketTrend: 'bullish' as const,
    };

    // Initialize Jupiter metrics
    this.jupiterMetrics = {
      totalValueLocked: 1800000 + Math.random() * 800000,
      averageAPY: 18.2 + Math.random() * 3,
      activeStrategies: 3,
      yieldOpportunities: 12 + Math.floor(Math.random() * 8),
      liquidityDepth: 0.85 + Math.random() * 0.1,
      priceImpact: 0.2 + Math.random() * 0.3,
      lastUpdated: new Date(),
    };

    // Initialize fund metrics
    this.fundMetrics = [
      {
        fundId: 1,
        totalStaked: 600000 + Math.random() * 200000,
        userCount: 5000 + Math.floor(Math.random() * 2000),
        averageAPY: 15.5 + Math.random() * 2,
        utilization: 0.92 + Math.random() * 0.05,
        tierDistribution: {
          tier1: 0.45 + Math.random() * 0.1,
          tier2: 0.35 + Math.random() * 0.1,
          tier3: 0.20 + Math.random() * 0.1,
        },
        lastUpdated: new Date(),
      },
      {
        fundId: 2,
        totalStaked: 400000 + Math.random() * 150000,
        userCount: 3500 + Math.floor(Math.random() * 1500),
        averageAPY: 17.8 + Math.random() * 2,
        utilization: 0.88 + Math.random() * 0.08,
        tierDistribution: {
          tier1: 0.40 + Math.random() * 0.1,
          tier2: 0.40 + Math.random() * 0.1,
          tier3: 0.20 + Math.random() * 0.1,
        },
        lastUpdated: new Date(),
      },
    ];
  }

  private startRealTimeUpdates() {
    // Update protocol metrics every 3 seconds
    this.protocolInterval = setInterval(() => {
      this.updateProtocolMetrics();
    }, 3000);

    // Update Jupiter metrics every 5 seconds
    this.jupiterInterval = setInterval(() => {
      this.updateJupiterMetrics();
    }, 5000);

    // Update fund metrics every 4 seconds
    this.fundInterval = setInterval(() => {
      this.updateFundMetrics();
    }, 4000);
  }

  private updateProtocolMetrics() {
    const now = new Date();
    const timeDiff = (now.getTime() - this.protocolMetrics.lastUpdated.getTime()) / 1000;

    // Simulate market movements
    const marketVolatility = 0.02; // 2% volatility
    const growthRate = 0.0001; // 0.01% per second growth
    
    // Update TVL with realistic market movements
    const tvlChange = this.protocolMetrics.totalValueLocked * 
      (growthRate * timeDiff + (Math.random() - 0.5) * marketVolatility);
    this.protocolMetrics.totalValueLocked = Math.max(1000000, 
      this.protocolMetrics.totalValueLocked + tvlChange);

    // Update staked amount (grows with TVL but with some lag)
    const stakingRatio = this.protocolMetrics.totalStaked / this.protocolMetrics.totalValueLocked;
    const targetStakingRatio = 0.75 + Math.random() * 0.1;
    const stakingAdjustment = (targetStakingRatio - stakingRatio) * this.protocolMetrics.totalValueLocked * 0.01;
    this.protocolMetrics.totalStaked = Math.max(500000, 
      this.protocolMetrics.totalStaked + stakingAdjustment);

    // Update yield (accumulates based on staked amount and APY)
    const yieldIncrease = this.protocolMetrics.totalStaked * 
      (this.protocolMetrics.averageAPY / 100) * (timeDiff / (365 * 24 * 60 * 60));
    this.protocolMetrics.totalYield += yieldIncrease;

    // Update APY with market conditions
    const apyVolatility = 0.5; // 0.5% APY volatility
    this.protocolMetrics.averageAPY = Math.max(10, Math.min(25,
      this.protocolMetrics.averageAPY + (Math.random() - 0.5) * apyVolatility));

    // Update user count (gradual growth)
    if (Math.random() < 0.1) { // 10% chance to add users
      this.protocolMetrics.userCount += Math.floor(Math.random() * 5) + 1;
    }

    // Update fund utilization
    this.protocolMetrics.fundUtilization = Math.max(0.7, Math.min(0.98,
      this.protocolMetrics.fundUtilization + (Math.random() - 0.5) * 0.02));

    // Update risk score based on market conditions
    this.protocolMetrics.riskScore = Math.max(0.05, Math.min(0.3,
      this.protocolMetrics.riskScore + (Math.random() - 0.5) * 0.01));

    // Update market trend
    if (Math.random() < 0.1) { // 10% chance to change trend
      const trends: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
      this.protocolMetrics.marketTrend = trends[Math.floor(Math.random() * trends.length)];
    }

    // Update timestamp
    this.protocolMetrics.lastUpdated = now;

    // Emit updated metrics
    this.emit('protocolMetrics', { ...this.protocolMetrics });
  }

  private updateJupiterMetrics() {
    const now = new Date();
    const timeDiff = (now.getTime() - this.jupiterMetrics.lastUpdated.getTime()) / 1000;

    // Update Jupiter TVL (correlated with protocol TVL)
    const jupiterTvlChange = this.protocolMetrics.totalValueLocked * 
      (0.00005 * timeDiff + (Math.random() - 0.5) * 0.015);
    this.jupiterMetrics.totalValueLocked = Math.max(800000,
      this.jupiterMetrics.totalValueLocked + jupiterTvlChange);

    // Update Jupiter APY (slightly higher than protocol average)
    const jupiterApyChange = (Math.random() - 0.5) * 0.8;
    this.jupiterMetrics.averageAPY = Math.max(15, Math.min(28,
      this.jupiterMetrics.averageAPY + jupiterApyChange));

    // Update yield opportunities
    if (Math.random() < 0.2) { // 20% chance to change opportunities
      this.jupiterMetrics.yieldOpportunities = Math.max(8, Math.min(25,
        this.jupiterMetrics.yieldOpportunities + (Math.random() > 0.5 ? 1 : -1)));
    }

    // Update liquidity depth
    this.jupiterMetrics.liquidityDepth = Math.max(0.7, Math.min(0.95,
      this.jupiterMetrics.liquidityDepth + (Math.random() - 0.5) * 0.03));

    // Update price impact
    this.jupiterMetrics.priceImpact = Math.max(0.1, Math.min(0.8,
      this.jupiterMetrics.priceImpact + (Math.random() - 0.5) * 0.05));

    // Update timestamp
    this.jupiterMetrics.lastUpdated = now;

    // Emit updated Jupiter metrics
    this.emit('jupiterMetrics', { ...this.jupiterMetrics });
  }

  private updateFundMetrics() {
    const now = new Date();

    this.fundMetrics.forEach((fund, index) => {
      const timeDiff = (now.getTime() - fund.lastUpdated.getTime()) / 1000;

      // Update fund staking (correlated with protocol growth)
      const fundGrowth = this.protocolMetrics.stakingGrowth * fund.totalStaked * timeDiff * 0.1;
      fund.totalStaked = Math.max(100000, fund.totalStaked + fundGrowth);

      // Update user count
      if (Math.random() < 0.15) { // 15% chance to add users
        fund.userCount += Math.floor(Math.random() * 3) + 1;
      }

      // Update APY (varies by fund)
      const apyVariation = (Math.random() - 0.5) * 0.6;
      fund.averageAPY = Math.max(12, Math.min(24, fund.averageAPY + apyVariation));

      // Update utilization
      fund.utilization = Math.max(0.75, Math.min(0.98,
        fund.utilization + (Math.random() - 0.5) * 0.02));

      // Update tier distribution (gradual shifts)
      const tierShift = (Math.random() - 0.5) * 0.02;
      fund.tierDistribution.tier1 = Math.max(0.3, Math.min(0.6, fund.tierDistribution.tier1 + tierShift));
      fund.tierDistribution.tier2 = Math.max(0.25, Math.min(0.5, fund.tierDistribution.tier2 - tierShift * 0.5));
      fund.tierDistribution.tier3 = Math.max(0.1, Math.min(0.3, fund.tierDistribution.tier3 - tierShift * 0.5));

      // Normalize tier distribution
      const total = fund.tierDistribution.tier1 + fund.tierDistribution.tier2 + fund.tierDistribution.tier3;
      fund.tierDistribution.tier1 /= total;
      fund.tierDistribution.tier2 /= total;
      fund.tierDistribution.tier3 /= total;

      // Update timestamp
      fund.lastUpdated = now;
    });

    // Emit updated fund metrics
    this.emit('fundMetrics', [...this.fundMetrics]);
  }

  // Public methods to get current metrics
  getProtocolMetrics(): ProtocolMetrics {
    return { ...this.protocolMetrics };
  }

  getJupiterMetrics(): JupiterMetrics {
    return { ...this.jupiterMetrics };
  }

  getFundMetrics(): FundMetrics[] {
    return [...this.fundMetrics];
  }

  // Method to manually refresh Jupiter data
  async refreshJupiterData(): Promise<JupiterMetrics> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Update Jupiter metrics with fresh data
    this.updateJupiterMetrics();
    
    return this.getJupiterMetrics();
  }

  // Cleanup method
  cleanup() {
    if (this.protocolInterval) {
      clearInterval(this.protocolInterval);
      this.protocolInterval = null;
    }
    if (this.jupiterInterval) {
      clearInterval(this.jupiterInterval);
      this.jupiterInterval = null;
    }
    if (this.fundInterval) {
      clearInterval(this.fundInterval);
      this.fundInterval = null;
    }
  }
}

// Create singleton instance
export const realTimeMetricsService = new RealTimeMetricsService();

// React hook for using real-time protocol metrics
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = React.useState<ProtocolMetrics | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleProtocolMetrics = (data: ProtocolMetrics) => {
      setMetrics(data);
      setIsConnected(true);
    };

    // Subscribe to updates
    realTimeMetricsService.on('protocolMetrics', handleProtocolMetrics);
    
    // Get initial data
    const initialMetrics = realTimeMetricsService.getProtocolMetrics();
    setMetrics(initialMetrics);
    setIsConnected(true);

    return () => {
      realTimeMetricsService.off('protocolMetrics', handleProtocolMetrics);
    };
  }, []);

  return { metrics, isConnected };
};

// React hook for Jupiter metrics
export const useJupiterMetrics = () => {
  const [jupiterMetrics, setJupiterMetrics] = React.useState<JupiterMetrics | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleJupiterMetrics = (data: JupiterMetrics) => {
      setJupiterMetrics(data);
      setIsConnected(true);
    };

    // Subscribe to updates
    realTimeMetricsService.on('jupiterMetrics', handleJupiterMetrics);
    
    // Get initial data
    const initialMetrics = realTimeMetricsService.getJupiterMetrics();
    setJupiterMetrics(initialMetrics);
    setIsConnected(true);

    return () => {
      realTimeMetricsService.off('jupiterMetrics', handleJupiterMetrics);
    };
  }, []);

  return { jupiterMetrics, isConnected };
};

// React hook for fund metrics
export const useFundMetrics = () => {
  const [fundMetrics, setFundMetrics] = React.useState<FundMetrics[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleFundMetrics = (data: FundMetrics[]) => {
      setFundMetrics(data);
      setIsConnected(true);
    };

    // Subscribe to updates
    realTimeMetricsService.on('fundMetrics', handleFundMetrics);
    
    // Get initial data
    const initialMetrics = realTimeMetricsService.getFundMetrics();
    setFundMetrics(initialMetrics);
    setIsConnected(true);

    return () => {
      realTimeMetricsService.off('fundMetrics', handleFundMetrics);
    };
  }, []);

  return { fundMetrics, isConnected };
};
