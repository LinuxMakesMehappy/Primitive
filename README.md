# Primitive Protocol

A revolutionary DeFi staking protocol built on Solana with Jupiter framework integration for advanced yield farming and tiered staking rewards.

## 🌟 Features

### Core Protocol Features
- **Tiered Staking System**: 3 tiers with different APY rates (5%, 7.5%, 10%)
- **Instant Unstaking**: No lock-up periods, withdraw anytime
- **Loyalty Scoring**: Proof of Loyalty and Liquidity based on time and amount staked
- **Dynamic Tier Shuffling**: Users move between tiers based on loyalty scores
- **Fund Management**: 100-user funds with automatic rotation

### Jupiter Integration
- **Yield Farming**: Automatic yield optimization through Jupiter
- **Multi-Strategy Support**: LP farming, staking, and yield strategies
- **Risk Management**: Low, medium, and high-risk yield opportunities
- **Real-time APY**: Dynamic APY calculations based on market conditions

### User Experience
- **Modern DApp**: Beautiful, responsive React interface
- **Wallet Integration**: Support for Phantom, Solflare, Torus, and more
- **Real-time Metrics**: Live protocol statistics and user analytics
- **Mobile Responsive**: Optimized for all device sizes

## 🏗️ Architecture

### Smart Contract (Anchor)
- **Protocol Management**: Central protocol state and configuration
- **Fund Management**: Individual fund creation and management
- **User Management**: Staking positions and loyalty tracking
- **Yield Distribution**: Automated yield calculation and distribution

### Frontend (React + TypeScript)
- **Dashboard**: Protocol overview and user statistics
- **Staking Panel**: Stake, unstake, and claim yield
- **Yield Opportunities**: Jupiter yield farming strategies
- **User Profile**: Personal statistics and loyalty levels

### Jupiter Integration
- **Yield Strategies**: Automated yield farming on Jupiter
- **Route Optimization**: Best yield routes and strategies
- **Risk Assessment**: Strategy risk levels and APY calculations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Solana CLI tools
- Anchor Framework
- A Solana wallet (Phantom recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LinuxMakesMehappy/Primitive.git
cd Primitive
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the smart contract**
```bash
anchor build
```

4. **Deploy to localnet (for testing)**
```bash
anchor deploy
```

5. **Start the DApp**
```bash
npm start
```

### Configuration

1. **Update program ID** in `Anchor.toml` and `src/idl/primitive_protocol.ts`
2. **Set RPC endpoint** in `src/App.tsx` (mainnet/devnet/localnet)
3. **Configure Jupiter settings** in `src/services/jupiter-service.ts`

## 📊 Protocol Mechanics

### Tier System
- **Tier 1**: 5% APY, 1000 SOL minimum
- **Tier 2**: 7.5% APY, 5000 SOL minimum  
- **Tier 3**: 10% APY, 10000 SOL minimum

### Loyalty Scoring
```
Loyalty Score = (Time Staked × 10) + (Amount Factor)
Amount Factor = Staked Amount / 1,000,000
```

### Fund Rotation
- Each fund accommodates 100 users
- When full, a new fund is created
- Users are shuffled between tiers based on loyalty scores
- Lowest loyalty users in higher tiers move to lower tiers

### Yield Distribution
- Protocol stakes all funds on Jupiter
- Yield is distributed based on tier APY rates
- Additional yield from Jupiter strategies
- Real-time yield calculation and distribution

## 🔧 Development

### Smart Contract Development
```bash
# Run tests
anchor test

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Frontend Development
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Testing
```bash
# Run all tests
npm run test:all

# Test smart contract
anchor test

# Test frontend
npm test
```

## 📁 Project Structure

```
Primitive/
├── programs/
│   └── primitive_protocol/     # Anchor smart contract
│       ├── src/
│       │   └── lib.rs         # Main program logic
│       └── Cargo.toml
├── src/
│   ├── components/            # React components
│   │   ├── Dashboard.tsx
│   │   ├── ProtocolMetrics.tsx
│   │   ├── StakingPanel.tsx
│   │   ├── YieldOpportunities.tsx
│   │   └── UserProfile.tsx
│   ├── services/             # Business logic
│   │   ├── protocol-client.ts
│   │   └── jupiter-service.ts
│   ├── idl/                  # Anchor IDL
│   │   └── primitive_protocol.ts
│   ├── App.tsx
│   └── index.tsx
├── public/                   # Static assets
├── Anchor.toml              # Anchor configuration
├── package.json
└── README.md
```

## 🔒 Security

### Smart Contract Security
- Comprehensive input validation
- Reentrancy protection
- Overflow/underflow checks
- Access control mechanisms
- Extensive testing coverage

### Frontend Security
- Wallet signature verification
- Transaction confirmation
- Error handling and user feedback
- Secure API communication

## 🌐 Deployment

### Smart Contract Deployment
1. Build the program: `anchor build`
2. Deploy to devnet: `anchor deploy --provider.cluster devnet`
3. Update program ID in configuration files
4. Deploy to mainnet: `anchor deploy --provider.cluster mainnet`

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)
3. Configure environment variables
4. Update RPC endpoints for production

## 📈 Monitoring

### Protocol Metrics
- Total Value Locked (TVL)
- Total Yield Generated
- Average APY
- Active Users
- Fund Performance

### User Analytics
- Staking positions
- Loyalty scores
- Yield earned
- Transaction history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/LinuxMakesMehappy/Primitive/wiki)
- **Issues**: [GitHub Issues](https://github.com/LinuxMakesMehappy/Primitive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LinuxMakesMehappy/Primitive/discussions)

## 🙏 Acknowledgments

- [Anchor Framework](https://anchor-lang.com/) for Solana development
- [Jupiter](https://jup.ag/) for yield farming integration
- [Solana Labs](https://solana.com/) for the blockchain platform
- [React](https://reactjs.org/) for the frontend framework

---

**Built with ❤️ by LinuxMakesMehappy**

*Primitive Protocol - Revolutionizing DeFi on Solana*
