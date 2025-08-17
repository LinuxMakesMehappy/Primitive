import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PrimitiveProtocol } from "../target/types/primitive_protocol";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fs from "fs";

async function main() {
  // Configure the client to use the devnet cluster
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  // Configure the client to use the devnet cluster
  anchor.setProvider(
    new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(loadKeypair("deploy-wallet.json")),
      { commitment: "confirmed" }
    )
  );

  const program = anchor.workspace.PrimitiveProtocol as Program<PrimitiveProtocol>;

  console.log("🚀 Deploying Primitive Protocol to devnet...");
  console.log("Program ID:", program.programId.toString());

  try {
    // Initialize the protocol
    console.log("📋 Initializing protocol...");
    
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    // Create a mock Jupiter vault (in production, this would be a real Jupiter vault)
    const jupiterVault = Keypair.generate();

    const protocolBump = 0; // This would be calculated in real implementation

    await program.methods
      .initializeProtocol(protocolBump)
      .accounts({
        protocol: protocolPda,
        authority: program.provider.publicKey!,
        jupiterVault: jupiterVault.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Protocol initialized successfully!");
    console.log("Protocol PDA:", protocolPda.toString());
    console.log("Jupiter Vault:", jupiterVault.publicKey.toString());

    // Create the first fund
    console.log("📊 Creating initial fund...");
    
    const fund = Keypair.generate();
    const fundId = new anchor.BN(1);
    const maxUsers = 100;
    const tier1Apy = 500; // 5.00%
    const tier2Apy = 750; // 7.50%
    const tier3Apy = 1000; // 10.00%

    await program.methods
      .createFund(fundId, maxUsers, tier1Apy, tier2Apy, tier3Apy)
      .accounts({
        fund: fund.publicKey,
        authority: program.provider.publicKey!,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([fund])
      .rpc();

    console.log("✅ Initial fund created successfully!");
    console.log("Fund Address:", fund.publicKey.toString());
    console.log("Fund ID:", fundId.toString());
    console.log("Max Users:", maxUsers);
    console.log("Tier 1 APY:", tier1Apy / 100, "%");
    console.log("Tier 2 APY:", tier2Apy / 100, "%");
    console.log("Tier 3 APY:", tier3Apy / 100, "%");

    // Save deployment info
    const deploymentInfo = {
      programId: program.programId.toString(),
      protocolPda: protocolPda.toString(),
      jupiterVault: jupiterVault.publicKey.toString(),
      fundAddress: fund.publicKey.toString(),
      fundId: fundId.toString(),
      maxUsers,
      tier1Apy,
      tier2Apy,
      tier3Apy,
      network: "devnet",
      deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      "deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📄 Deployment info saved to deployment-info.json");

    // Display deployment summary
    console.log("\n🎉 Deployment Summary:");
    console.log("======================");
    console.log("Network: Devnet");
    console.log("Program ID:", deploymentInfo.programId);
    console.log("Protocol PDA:", deploymentInfo.protocolPda);
    console.log("Fund Address:", deploymentInfo.fundAddress);
    console.log("Jupiter Vault:", deploymentInfo.jupiterVault);
    console.log("Max Users per Fund:", deploymentInfo.maxUsers);
    console.log("Tier APYs:", {
      "Tier 1": deploymentInfo.tier1Apy / 100 + "%",
      "Tier 2": deploymentInfo.tier2Apy / 100 + "%",
      "Tier 3": deploymentInfo.tier3Apy / 100 + "%",
    });

    console.log("\n🔗 Next Steps:");
    console.log("1. Update the program ID in your frontend configuration");
    console.log("2. Update the fund address in your DApp");
    console.log("3. Test the protocol with the DApp");
    console.log("4. Deploy to mainnet when ready");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

function loadKeypair(filename: string): Keypair {
  try {
    const secretKey = new Uint8Array(
      JSON.parse(fs.readFileSync(filename, "utf-8"))
    );
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error(`Failed to load keypair from ${filename}:`, error);
    console.log("Creating a new keypair for deployment...");
    
    const newKeypair = Keypair.generate();
    fs.writeFileSync(filename, JSON.stringify(Array.from(newKeypair.secretKey)));
    
    console.log(`New keypair saved to ${filename}`);
    console.log("⚠️  IMPORTANT: Fund this wallet with SOL before deploying!");
    console.log("Public Key:", newKeypair.publicKey.toString());
    
    return newKeypair;
  }
}

// Helper function to airdrop SOL to the deploy wallet
async function airdropSol(connection: anchor.web3.Connection, wallet: Keypair) {
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < LAMPORTS_PER_SOL) {
      console.log("💰 Airdropping SOL to deploy wallet...");
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log("✅ Airdrop successful!");
    } else {
      console.log("✅ Wallet has sufficient balance");
    }
  } catch (error) {
    console.error("❌ Airdrop failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
