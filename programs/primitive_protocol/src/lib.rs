use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod primitive_protocol {
    use super::*;

    // Initialize the protocol
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        protocol_bump: u8,
    ) -> Result<()> {
        let protocol = &mut ctx.accounts.protocol;
        protocol.authority = ctx.accounts.authority.key();
        protocol.bump = protocol_bump;
        protocol.total_staked = 0;
        protocol.total_yield = 0;
        protocol.current_fund_id = 0;
        protocol.jupiter_vault = ctx.accounts.jupiter_vault.key();
        protocol.is_active = true;
        Ok(())
    }

    // Create a new fund
    pub fn create_fund(
        ctx: Context<CreateFund>,
        fund_id: u64,
        max_users: u32,
        tier1_apy: u16,
        tier2_apy: u16,
        tier3_apy: u16,
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        fund.id = fund_id;
        fund.max_users = max_users;
        fund.current_users = 0;
        fund.tier1_apy = tier1_apy;
        fund.tier2_apy = tier2_apy;
        fund.tier3_apy = tier3_apy;
        fund.total_staked = 0;
        fund.is_active = true;
        fund.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    // Stake tokens into the protocol
    pub fn stake(
        ctx: Context<Stake>,
        amount: u64,
        tier: u8,
    ) -> Result<()> {
        require!(tier >= 1 && tier <= 3, PrimitiveError::InvalidTier);
        
        let user = &mut ctx.accounts.user;
        let fund = &mut ctx.accounts.fund;
        let protocol = &mut ctx.accounts.protocol;

        // Check if fund is full
        require!(fund.current_users < fund.max_users, PrimitiveError::FundFull);

        // Transfer tokens to protocol vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.protocol_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user staking info
        user.wallet = ctx.accounts.user.key();
        user.current_stake = amount;
        user.tier = tier;
        user.fund_id = fund.id;
        user.staked_at = Clock::get()?.unix_timestamp;
        user.last_claim = Clock::get()?.unix_timestamp;
        user.loyalty_score = calculate_loyalty_score(user, amount)?;
        user.is_active = true;

        // Update fund and protocol stats
        fund.current_users += 1;
        fund.total_staked += amount;
        protocol.total_staked += amount;

        Ok(())
    }

    // Unstake tokens with instant withdrawal
    pub fn unstake(
        ctx: Context<Unstake>,
        amount: u64,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let fund = &mut ctx.accounts.fund;
        let protocol = &mut ctx.accounts.protocol;

        require!(user.current_stake >= amount, PrimitiveError::InsufficientStake);
        require!(user.is_active, PrimitiveError::UserNotActive);

        // Calculate yield before unstaking
        let yield_earned = calculate_yield(user, fund)?;
        
        // Transfer staked amount back to user
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.protocol_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Transfer yield if any
        if yield_earned > 0 {
            let yield_transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.protocol_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.protocol.to_account_info(),
                },
            );
            token::transfer(yield_transfer_ctx, yield_earned)?;
        }

        // Update user and protocol stats
        user.current_stake -= amount;
        user.last_claim = Clock::get()?.unix_timestamp;
        
        if user.current_stake == 0 {
            user.is_active = false;
            fund.current_users -= 1;
        }

        fund.total_staked -= amount;
        protocol.total_staked -= amount;
        protocol.total_yield += yield_earned;

        Ok(())
    }

    // Claim yield rewards
    pub fn claim_yield(
        ctx: Context<ClaimYield>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let fund = &mut ctx.accounts.fund;

        require!(user.is_active, PrimitiveError::UserNotActive);

        let yield_earned = calculate_yield(user, fund)?;
        require!(yield_earned > 0, PrimitiveError::NoYieldToClaim);

        // Transfer yield to user
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.protocol_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, yield_earned)?;

        user.last_claim = Clock::get()?.unix_timestamp;
        user.loyalty_score += yield_earned / 1000; // Increase loyalty score based on yield claimed

        Ok(())
    }

    // Shuffle users between tiers based on loyalty scores
    pub fn shuffle_tiers(
        ctx: Context<ShuffleTiers>,
    ) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        
        // This would typically involve complex logic to sort users by loyalty score
        // and move them between tiers. For simplicity, we'll just update the fund
        fund.last_shuffle = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Update Jupiter vault for yield farming
    pub fn update_jupiter_vault(
        ctx: Context<UpdateJupiterVault>,
        new_vault: Pubkey,
    ) -> Result<()> {
        let protocol = &mut ctx.accounts.protocol;
        protocol.jupiter_vault = new_vault;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(protocol_bump: u8)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Protocol::LEN,
        seeds = [b"protocol"],
        bump = protocol_bump
    )]
    pub protocol: Account<'info, Protocol>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Jupiter vault for yield farming
    pub jupiter_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateFund<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Fund::LEN
    )]
    pub fund: Account<'info, Fund>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + User::LEN,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(mut)]
    pub protocol: Account<'info, Protocol>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol.bump
    )]
    pub protocol: Account<'info, Protocol>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol.bump
    )]
    pub protocol: Account<'info, Protocol>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub protocol_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ShuffleTiers<'info> {
    #[account(mut)]
    pub fund: Account<'info, Fund>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateJupiterVault<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol.bump
    )]
    pub protocol: Account<'info, Protocol>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct Protocol {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_staked: u64,
    pub total_yield: u64,
    pub current_fund_id: u64,
    pub jupiter_vault: Pubkey,
    pub is_active: bool,
}

impl Protocol {
    pub const LEN: usize = 32 + 1 + 8 + 8 + 8 + 32 + 1;
}

#[account]
pub struct Fund {
    pub id: u64,
    pub max_users: u32,
    pub current_users: u32,
    pub tier1_apy: u16,
    pub tier2_apy: u16,
    pub tier3_apy: u16,
    pub total_staked: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub last_shuffle: i64,
}

impl Fund {
    pub const LEN: usize = 8 + 4 + 4 + 2 + 2 + 2 + 8 + 1 + 8 + 8;
}

#[account]
pub struct User {
    pub wallet: Pubkey,
    pub current_stake: u64,
    pub tier: u8,
    pub fund_id: u64,
    pub staked_at: i64,
    pub last_claim: i64,
    pub loyalty_score: u64,
    pub is_active: bool,
}

impl User {
    pub const LEN: usize = 32 + 8 + 1 + 8 + 8 + 8 + 8 + 1;
}

// Helper functions
fn calculate_loyalty_score(user: &User, amount: u64) -> Result<u64> {
    let time_factor = (Clock::get()?.unix_timestamp - user.staked_at) / 86400; // Days
    let amount_factor = amount / 1_000_000; // Normalize to millions
    Ok(time_factor * 10 + amount_factor)
}

fn calculate_yield(user: &User, fund: &Fund) -> Result<u64> {
    let time_staked = Clock::get()?.unix_timestamp - user.last_claim;
    let apy = match user.tier {
        1 => fund.tier1_apy,
        2 => fund.tier2_apy,
        3 => fund.tier3_apy,
        _ => return Err(PrimitiveError::InvalidTier.into()),
    };
    
    let yield_rate = (apy as f64) / 100.0 / 365.0 / 86400.0; // Daily rate
    let yield_amount = (user.current_stake as f64) * yield_rate * (time_staked as f64);
    
    Ok(yield_amount as u64)
}

#[error_code]
pub enum PrimitiveError {
    #[msg("Invalid tier selected")]
    InvalidTier,
    #[msg("Fund is full")]
    FundFull,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("User is not active")]
    UserNotActive,
    #[msg("No yield to claim")]
    NoYieldToClaim,
}
