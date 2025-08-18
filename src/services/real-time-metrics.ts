import { EventEmitter } from 'events';
import React from 'react';

export interface ProtocolMetrics {
  totalValueLocked: number;
  totalStaked: number;
  totalYield: number;
  currentFundId: number;
  isActive: boolean;
  averageAPY: number;
  activeStrategies: number;
  lastUpdated: Date;
}

export interface JupiterMetrics {
  totalValueLocked: number;
  averageAPY: number;
  activeStrategies: number;
  yieldOpportunities: Array<{
    id: string;
    name: string;
    apy: number;
    risk: 'low' | 'medium' | 'high';
    strategy: string;
    priceImpact: number;
  }>;
}

class RealTimeMetricsService extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private baseMetrics: ProtocolMetrics;

  constructor() {
    super();
    this.baseMetrics = {
      totalValueLocked: 1250000, // 1.25M SOL
      totalStaked: 980000, // 980K SOL
      totalYield: 45000, // 45K SOL
      currentFundId: 3,
      isActive: true,
      averageAPY: 18.5,
      activeStrategies: 5,
      lastUpdated: new Date(),
    };
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.updateMetrics();
    }, 3000); // Update every 3 seconds
    
    // Emit initial metrics
    this.emit('metrics', this.baseMetrics);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  private updateMetrics() {
    // Simulate realistic market movements
    const volatility = 0.02; // 2% volatility
    const timeFactor = Date.now() / 1000000; // Time-based variation
    
    // Update TVL with realistic fluctuations
    const tvlChange = (Math.sin(timeFactor) * volatility + Math.random() * 0.01) * this.baseMetrics.totalValueLocked;
    this.baseMetrics.totalValueLocked = Math.max(1000000, this.baseMetrics.totalValueLocked + tvlChange);
    
    // Update total staked (usually follows TVL)
    const stakedChange = tvlChange * 0.8 + (Math.random() - 0.5) * 1000;
    this.baseMetrics.totalStaked = Math.max(800000, this.baseMetrics.totalStaked + stakedChange);
    
    // Update total yield (accumulates over time)
    const yieldRate = this.baseMetrics.averageAPY / 100 / 365 / 24 / 60 / 60; // Per second
    const yieldIncrease = this.baseMetrics.totalStaked * yieldRate * 3; // 3 seconds
    this.baseMetrics.totalYield += yieldIncrease;
    
    // Update APY with market conditions
    const apyChange = (Math.sin(timeFactor * 0.5) * 0.5 + Math.random() * 0.2);
    this.baseMetrics.averageAPY = Math.max(8, Math.min(25, this.baseMetrics.averageAPY + apyChange));
    
    // Occasionally change active strategies
    if (Math.random() < 0.1) { // 10% chance every 3 seconds
      this.baseMetrics.activeStrategies = Math.max(3, Math.min(8, this.baseMetrics.activeStrategies + (Math.random() > 0.5 ? 1 : -1)));
    }
    
    // Update timestamp
    this.baseMetrics.lastUpdated = new Date();
    
    // Emit updated metrics
    this.emit('metrics', { ...this.baseMetrics });
  }

  getCurrentMetrics(): ProtocolMetrics {
    return { ...this.baseMetrics };
  }

  // Simulate Jupiter API calls
  async getJupiterMetrics(): Promise<JupiterMetrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return {
      totalValueLocked: this.baseMetrics.totalValueLocked * 1.1, // Jupiter has slightly more
      averageAPY: this.baseMetrics.averageAPY * (0.9 + Math.random() * 0.2),
      activeStrategies: this.baseMetrics.activeStrategies,
      yieldOpportunities: [
        {
          id: 'jup-1',
          name: 'Jupiter-USDC LP',
          apy: 12.5 + Math.random() * 3,
          risk: 'low' as const,
          strategy: 'Liquidity Provision',
          priceImpact: 0.1 + Math.random() * 0.2,
        },
        {
          id: 'jup-2',
          name: 'Jupiter-SOL LP',
          apy: 18.2 + Math.random() * 4,
          risk: 'medium' as const,
          strategy: 'Yield Farming',
          priceImpact: 0.3 + Math.random() * 0.3,
        },
        {
          id: 'jup-3',
          name: 'Jupiter-RAY LP',
          apy: 22.8 + Math.random() * 5,
          risk: 'high' as const,
          strategy: 'Leveraged Yield',
          priceImpact: 0.5 + Math.random() * 0.4,
        },
      ],
    };
  }
}

// Create singleton instance
export const realTimeMetricsService = new RealTimeMetricsService();

// React hook for using real-time metrics
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = React.useState<ProtocolMetrics | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleMetrics = (newMetrics: ProtocolMetrics) => {
      setMetrics(newMetrics);
      setIsConnected(true);
    };

    // Start the service
    realTimeMetricsService.start();
    
    // Subscribe to metrics updates
    realTimeMetricsService.on('metrics', handleMetrics);
    
    // Get initial metrics
    setMetrics(realTimeMetricsService.getCurrentMetrics());
    setIsConnected(true);

    return () => {
      realTimeMetricsService.off('metrics', handleMetrics);
      realTimeMetricsService.stop();
    };
  }, []);

  return { metrics, isConnected };
};
