import { Connection, Commitment } from '@solana/web3.js';

const RPC_ENDPOINTS = [
  'https://solana-mainnet.rpc.extrnode.com',
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
];

class FallbackRPCConnection {
  private endpoints: string[];
  private currentIndex: number = 0;
  private connection: Connection;

  constructor(endpoints: string[] = RPC_ENDPOINTS, commitment: Commitment = 'confirmed') {
    this.endpoints = endpoints;
    this.connection = new Connection(this.endpoints[0], commitment);
  }

  private async switchEndpoint() {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
    this.connection = new Connection(this.endpoints[this.currentIndex], 'confirmed');
    console.log(`Switched to RPC endpoint: ${this.endpoints[this.currentIndex]}`);
  }

  private async executeWithFallback<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = this.endpoints.length;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`RPC attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          await this.switchEndpoint();
          // Add a small delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError || new Error('All RPC endpoints failed');
  }

  async getBalance(publicKey: any): Promise<number> {
    return this.executeWithFallback(() => this.connection.getBalance(publicKey));
  }

  async getParsedTokenAccountsByOwner(owner: any, filter: any): Promise<any> {
    return this.executeWithFallback(() => this.connection.getParsedTokenAccountsByOwner(owner, filter));
  }

  async getSignaturesForAddress(address: any, options?: any): Promise<any[]> {
    return this.executeWithFallback(() => this.connection.getSignaturesForAddress(address, options));
  }

  async getParsedTransaction(signature: string, options?: any): Promise<any> {
    return this.executeWithFallback(() => this.connection.getParsedTransaction(signature, options));
  }

  getConnection(): Connection {
    return this.connection;
  }

  getCurrentEndpoint(): string {
    return this.endpoints[this.currentIndex];
  }
}

export const fallbackRPCConnection = new FallbackRPCConnection();
