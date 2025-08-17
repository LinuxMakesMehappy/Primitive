import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IDL } from '../idl/primitive_protocol';
import { JupiterService } from './jupiter-service';

export interface ProtocolConfig {
  connection: Connection;
  wallet: any;
  programId: PublicKey;
}

export interface StakingInfo {
  currentStake: number;
  tier: number;
  fundId: number;
  stakedAt: Date;
  lastClaim: Date;
  loyaltyScore: number;
  isActive: boolean;
}

export interface FundInfo {
  id: number;
  maxUsers: number;
  currentUsers: number;
  tier1Apy: number;
  tier2Apy: number;
  tier3Apy: number;
  totalStaked: number;
  isActive: boolean;
  createdAt: Date;
  lastShuffle: Date;
}

export class ProtocolClient {
  private program: Program;
  private connection: Connection;
  private jupiterService: JupiterService;
  private protocolPubkey: PublicKey;

  constructor(config: ProtocolConfig) {
    this.connection = config.connection;
    
    const provider = new AnchorProvider(
      this.connection,
      config.wallet,
      { commitment: 'confirmed' }
    );

    this.program = new Program(IDL as any, config.programId, provider);
    
    // Initialize Jupiter service
    this.jupiterService = new JupiterService({
      connection: this.connection,
      cluster: 'mainnet-beta',
      userPublicKey: config.wallet.publicKey,
    });

    // Derive protocol PDA
    this.protocolPubkey = PublicKey.findProgramAddressSync(
      [Buffer.from('protocol')],
      this.program.programId
    )[0];
  }

  async initialize(): Promise<void> {
    try {
      await this.jupiterService.initialize();
    } catch (error) {
      console.error('Failed to initialize protocol client:', error);
      throw error;
    }
  }

  async getProtocolInfo(): Promise<{
    totalStaked: number;
    totalYield: number;
    currentFundId: number;
    jupiterVault: PublicKey;
    isActive: boolean;
  }> {
    try {
      const protocol = await this.program.account.protocol.fetch(this.protocolPubkey);
      
      return {
        totalStaked: (protocol.totalStaked as any).toNumber(),
        totalYield: (protocol.totalYield as any).toNumber(),
        currentFundId: (protocol.currentFundId as any).toNumber(),
        jupiterVault: protocol.jupiterVault as PublicKey,
        isActive: protocol.isActive as boolean,
      };
    } catch (error) {
      console.error('Failed to get protocol info:', error);
      throw error;
    }
  }

  async getUserInfo(userWallet: PublicKey): Promise<StakingInfo | null> {
    try {
      const [userPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), userWallet.toBuffer()],
        this.program.programId
      );

      const user = await this.program.account.user.fetch(userPubkey);
      
      return {
        currentStake: (user.currentStake as any).toNumber(),
        tier: user.tier as number,
        fundId: (user.fundId as any).toNumber(),
        stakedAt: new Date((user.stakedAt as any).toNumber() * 1000),
        lastClaim: new Date((user.lastClaim as any).toNumber() * 1000),
        loyaltyScore: (user.loyaltyScore as any).toNumber(),
        isActive: user.isActive as boolean,
      };
    } catch (error) {
      // User doesn't exist yet
      return null;
    }
  }

  async getFundInfo(fundPubkey: PublicKey): Promise<FundInfo> {
    try {
      const fund = await this.program.account.fund.fetch(fundPubkey);
      
      return {
        id: (fund.id as any).toNumber(),
        maxUsers: fund.maxUsers as number,
        currentUsers: fund.currentUsers as number,
        tier1Apy: fund.tier1Apy as number,
        tier2Apy: fund.tier2Apy as number,
        tier3Apy: fund.tier3Apy as number,
        totalStaked: (fund.totalStaked as any).toNumber(),
        isActive: fund.isActive as boolean,
        createdAt: new Date((fund.createdAt as any).toNumber() * 1000),
        lastShuffle: new Date((fund.lastShuffle as any).toNumber() * 1000),
      };
    } catch (error) {
      console.error('Failed to get fund info:', error);
      throw error;
    }
  }

  async stake(
    fundPubkey: PublicKey,
    userTokenAccount: PublicKey,
    protocolVault: PublicKey,
    amount: number,
    tier: number
  ): Promise<string> {
    try {
      const [userPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), this.program.provider.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .stake(new BN(amount), tier)
        .accounts({
          user: userPubkey,
          fund: fundPubkey,
          protocol: this.protocolPubkey,
          userTokenAccount,
          protocolVault,
          authority: this.program.provider.publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Failed to stake:', error);
      throw error;
    }
  }

  async unstake(
    fundPubkey: PublicKey,
    userTokenAccount: PublicKey,
    protocolVault: PublicKey,
    amount: number
  ): Promise<string> {
    try {
      const [userPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), this.program.provider.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .unstake(new BN(amount))
        .accounts({
          user: userPubkey,
          fund: fundPubkey,
          protocol: this.protocolPubkey,
          userTokenAccount,
          protocolVault,
          authority: this.program.provider.publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Failed to unstake:', error);
      throw error;
    }
  }

  async claimYield(
    fundPubkey: PublicKey,
    userTokenAccount: PublicKey,
    protocolVault: PublicKey
  ): Promise<string> {
    try {
      const [userPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), this.program.provider.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .claimYield()
        .accounts({
          user: userPubkey,
          fund: fundPubkey,
          protocol: this.protocolPubkey,
          userTokenAccount,
          protocolVault,
          authority: this.program.provider.publicKey!,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Failed to claim yield:', error);
      throw error;
    }
  }

  async getYieldOpportunities(tokenMint: PublicKey): Promise<any[]> {
    return await this.jupiterService.getYieldOpportunities(tokenMint);
  }

  async executeYieldStrategy(strategy: any): Promise<string> {
    return await this.jupiterService.executeYieldStrategy(strategy);
  }

  async getProtocolMetrics(): Promise<any> {
    return await this.jupiterService.getProtocolMetrics();
  }

  async calculateLoyaltyScore(userInfo: StakingInfo): Promise<number> {
    const now = Date.now();
    const timeStaked = (now - userInfo.stakedAt.getTime()) / (1000 * 60 * 60 * 24); // Days
    const amountFactor = userInfo.currentStake / 1_000_000; // Normalize to millions
    return timeStaked * 10 + amountFactor;
  }

  async getTierRequirements(): Promise<{
    tier1: { minStake: number; apy: number };
    tier2: { minStake: number; apy: number };
    tier3: { minStake: number; apy: number };
  }> {
    // This would typically be fetched from the protocol
    return {
      tier1: { minStake: 1000, apy: 5.0 }, // 1000 SOL, 5% APY
      tier2: { minStake: 5000, apy: 7.5 }, // 5000 SOL, 7.5% APY
      tier3: { minStake: 10000, apy: 10.0 }, // 10000 SOL, 10% APY
    };
  }
}
