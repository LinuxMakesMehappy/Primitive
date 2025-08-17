import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PrimitiveProtocol } from "../target/types/primitive_protocol";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("primitive-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PrimitiveProtocol as Program<PrimitiveProtocol>;
  
  // Test accounts
  const authority = Keypair.generate();
  const user = Keypair.generate();
  const fund = Keypair.generate();
  const jupiterVault = Keypair.generate();

  before(async () => {
    // Airdrop SOL to test accounts
    const signature1 = await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature1);
    
    const signature2 = await provider.connection.requestAirdrop(user.publicKey, 5 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature2);
  });

  it("Initializes the protocol", async () => {
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const protocolBump = 0; // This would be calculated in real implementation

    await program.methods
      .initializeProtocol(protocolBump)
      .accounts({
        protocol: protocolPda,
        authority: authority.publicKey,
        jupiterVault: jupiterVault.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const protocolAccount = await program.account.protocol.fetch(protocolPda);
    
    expect(protocolAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(protocolAccount.isActive).to.be.true;
    expect(protocolAccount.totalStaked.toNumber()).to.equal(0);
    expect(protocolAccount.totalYield.toNumber()).to.equal(0);
  });

  it("Creates a new fund", async () => {
    const fundId = new anchor.BN(1);
    const maxUsers = 100;
    const tier1Apy = 500; // 5.00%
    const tier2Apy = 750; // 7.50%
    const tier3Apy = 1000; // 10.00%

    await program.methods
      .createFund(fundId, maxUsers, tier1Apy, tier2Apy, tier3Apy)
      .accounts({
        fund: fund.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority, fund])
      .rpc();

    const fundAccount = await program.account.fund.fetch(fund.publicKey);
    
    expect(fundAccount.id.toNumber()).to.equal(1);
    expect(fundAccount.maxUsers).to.equal(100);
    expect(fundAccount.currentUsers).to.equal(0);
    expect(fundAccount.tier1Apy).to.equal(500);
    expect(fundAccount.tier2Apy).to.equal(750);
    expect(fundAccount.tier3Apy).to.equal(1000);
    expect(fundAccount.isActive).to.be.true;
  });

  it("Stakes tokens into the protocol", async () => {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const stakeAmount = new anchor.BN(1000 * LAMPORTS_PER_SOL); // 1000 SOL
    const tier = 1;

    // Mock token accounts (in real implementation, these would be actual SPL token accounts)
    const userTokenAccount = Keypair.generate();
    const protocolVault = Keypair.generate();

    await program.methods
      .stake(stakeAmount, tier)
      .accounts({
        user: userPda,
        fund: fund.publicKey,
        protocol: protocolPda,
        userTokenAccount: userTokenAccount.publicKey,
        protocolVault: protocolVault.publicKey,
        user: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userAccount = await program.account.user.fetch(userPda);
    const fundAccount = await program.account.fund.fetch(fund.publicKey);
    const protocolAccount = await program.account.protocol.fetch(protocolPda);
    
    expect(userAccount.currentStake.toNumber()).to.equal(stakeAmount.toNumber());
    expect(userAccount.tier).to.equal(tier);
    expect(userAccount.isActive).to.be.true;
    expect(fundAccount.currentUsers).to.equal(1);
    expect(fundAccount.totalStaked.toNumber()).to.equal(stakeAmount.toNumber());
    expect(protocolAccount.totalStaked.toNumber()).to.equal(stakeAmount.toNumber());
  });

  it("Claims yield rewards", async () => {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    // Mock token accounts
    const userTokenAccount = Keypair.generate();
    const protocolVault = Keypair.generate();

    await program.methods
      .claimYield()
      .accounts({
        user: userPda,
        fund: fund.publicKey,
        protocol: protocolPda,
        userTokenAccount: userTokenAccount.publicKey,
        protocolVault: protocolVault.publicKey,
        user: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userAccount = await program.account.user.fetch(userPda);
    
    // Verify that last_claim was updated
    expect(userAccount.lastClaim.toNumber()).to.be.greaterThan(0);
  });

  it("Unstakes tokens", async () => {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const unstakeAmount = new anchor.BN(500 * LAMPORTS_PER_SOL); // 500 SOL

    // Mock token accounts
    const userTokenAccount = Keypair.generate();
    const protocolVault = Keypair.generate();

    await program.methods
      .unstake(unstakeAmount)
      .accounts({
        user: userPda,
        fund: fund.publicKey,
        protocol: protocolPda,
        userTokenAccount: userTokenAccount.publicKey,
        protocolVault: protocolVault.publicKey,
        user: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userAccount = await program.account.user.fetch(userPda);
    const fundAccount = await program.account.fund.fetch(fund.publicKey);
    const protocolAccount = await program.account.protocol.fetch(protocolPda);
    
    expect(userAccount.currentStake.toNumber()).to.equal(500 * LAMPORTS_PER_SOL);
    expect(userAccount.isActive).to.be.true;
    expect(fundAccount.totalStaked.toNumber()).to.equal(500 * LAMPORTS_PER_SOL);
    expect(protocolAccount.totalStaked.toNumber()).to.equal(500 * LAMPORTS_PER_SOL);
  });

  it("Shuffles tiers", async () => {
    await program.methods
      .shuffleTiers()
      .accounts({
        fund: fund.publicKey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const fundAccount = await program.account.fund.fetch(fund.publicKey);
    
    // Verify that last_shuffle was updated
    expect(fundAccount.lastShuffle.toNumber()).to.be.greaterThan(0);
  });

  it("Updates Jupiter vault", async () => {
    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const newVault = Keypair.generate();

    await program.methods
      .updateJupiterVault(newVault.publicKey)
      .accounts({
        protocol: protocolPda,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const protocolAccount = await program.account.protocol.fetch(protocolPda);
    
    expect(protocolAccount.jupiterVault.toString()).to.equal(newVault.publicKey.toString());
  });

  it("Handles invalid tier selection", async () => {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const stakeAmount = new anchor.BN(1000 * LAMPORTS_PER_SOL);
    const invalidTier = 4; // Invalid tier

    // Mock token accounts
    const userTokenAccount = Keypair.generate();
    const protocolVault = Keypair.generate();

    try {
      await program.methods
        .stake(stakeAmount, invalidTier)
        .accounts({
          user: userPda,
          fund: fund.publicKey,
          protocol: protocolPda,
          userTokenAccount: userTokenAccount.publicKey,
          protocolVault: protocolVault.publicKey,
          user: user.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have thrown an error for invalid tier");
    } catch (error) {
      expect(error.toString()).to.include("Invalid tier selected");
    }
  });

  it("Handles fund capacity limits", async () => {
    // Create a fund with max 1 user
    const smallFund = Keypair.generate();
    const fundId = new anchor.BN(2);
    const maxUsers = 1;

    await program.methods
      .createFund(fundId, maxUsers, 500, 750, 1000)
      .accounts({
        fund: smallFund.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority, smallFund])
      .rpc();

    // Try to add a second user to the full fund
    const secondUser = Keypair.generate();
    const [secondUserPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), secondUser.publicKey.toBuffer()],
      program.programId
    );

    const [protocolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    const stakeAmount = new anchor.BN(1000 * LAMPORTS_PER_SOL);
    const tier = 1;

    // Mock token accounts
    const userTokenAccount = Keypair.generate();
    const protocolVault = Keypair.generate();

    try {
      await program.methods
        .stake(stakeAmount, tier)
        .accounts({
          user: secondUserPda,
          fund: smallFund.publicKey,
          protocol: protocolPda,
          userTokenAccount: userTokenAccount.publicKey,
          protocolVault: protocolVault.publicKey,
          user: secondUser.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([secondUser])
        .rpc();
      
      expect.fail("Should have thrown an error for full fund");
    } catch (error) {
      expect(error.toString()).to.include("Fund is full");
    }
  });
});
