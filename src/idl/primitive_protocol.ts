export const IDL = {
  "version": "0.1.0",
  "name": "primitive_protocol",
  "instructions": [
    {
      "name": "initializeProtocol",
      "accounts": [
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "jupiterVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "protocolBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createFund",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fundId",
          "type": "u64"
        },
        {
          "name": "maxUsers",
          "type": "u32"
        },
        {
          "name": "tier1Apy",
          "type": "u16"
        },
        {
          "name": "tier2Apy",
          "type": "u16"
        },
        {
          "name": "tier3Apy",
          "type": "u16"
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimYield",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "protocolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "shuffleTiers",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "updateJupiterVault",
      "accounts": [
        {
          "name": "protocol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newVault",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Protocol",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "totalYield",
            "type": "u64"
          },
          {
            "name": "currentFundId",
            "type": "u64"
          },
          {
            "name": "jupiterVault",
            "type": "publicKey"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Fund",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "maxUsers",
            "type": "u32"
          },
          {
            "name": "currentUsers",
            "type": "u32"
          },
          {
            "name": "tier1Apy",
            "type": "u16"
          },
          {
            "name": "tier2Apy",
            "type": "u16"
          },
          {
            "name": "tier3Apy",
            "type": "u16"
          },
          {
            "name": "totalStaked",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "lastShuffle",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "User",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "currentStake",
            "type": "u64"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "fundId",
            "type": "u64"
          },
          {
            "name": "stakedAt",
            "type": "i64"
          },
          {
            "name": "lastClaim",
            "type": "i64"
          },
          {
            "name": "loyaltyScore",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTier",
      "msg": "Invalid tier selected"
    },
    {
      "code": 6001,
      "name": "FundFull",
      "msg": "Fund is full"
    },
    {
      "code": 6002,
      "name": "InsufficientStake",
      "msg": "Insufficient stake amount"
    },
    {
      "code": 6003,
      "name": "UserNotActive",
      "msg": "User is not active"
    },
    {
      "code": 6004,
      "name": "NoYieldToClaim",
      "msg": "No yield to claim"
    }
  ]
};
