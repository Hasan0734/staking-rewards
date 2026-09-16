# DeFi Staking Protocol with Dynamic Minting Architecture

A highly secure, optimized, and audit-ready **DeFi Staking Protocol** built with **Solidity v0.8.20**, **TypeScript**, and the **Hardhat** framework. This protocol features an algorithmic, time-weighted rewards engine modeled after industry-standard liquidity mining contracts (Synthetix Model). It seamlessly blends a staking custodian vault with an inflationary **ERC-20 Governance Token** mechanism using **OpenZeppelin Contracts**.

## 🚀 Key Features & Mechanism Design
- **On-Demand Inflationary Minting:** The protocol requires zero upfront capital seeding. Reward tokens are dynamically minted (`_mint`) directly into users' wallets the exact second they claim, eliminating the need to hold massive reserve pools inside the contract.
- **Synthetix Algorithmic Math Model:** Implements a time-weighted global tracking index (`rewardPerTokenStored`) to support varying staking amounts and uneven entry/exit intervals. It calculates yields precisely per second without requiring expensive loops, ensuring constant gas costs.
- **Precision Floating-Point Safeguards:** Utilizes a scale factor of 10¹⁸ (`1e18`) across all reward indexes to securely perform high-precision division, completely eliminating rounding errors caused by Solidity's lack of native floating-point numbers.
- **Gas Optimization:** Native token settings and contract state addresses are marked as `immutable`, reducing on-chain deployment weight and optimizing recurring transaction gas overhead.

---

## 🛡️ Smart Contract Security Controls

### 1. Unified Reward Lock Modifier (`updateReward`)
Every state-mutating transition (`stake`, `withdraw`, `claimReward`) is explicitly guarded by the custom `updateReward` modifier. This captures a structural snapshot of the global profit counter and locks the user's historical accrued earnings *before* their staked balance or total pool liquidity changes.

### 2. Standard ERC-20 Custody Pipeline
The protocol relies heavily on the decoupled **Approve-then-TransferFrom** flow. The contract securely takes custody of the external staking token only after the user grants explicit allowance via their web3 wallet provider.

### 3. Strict Checks-Effects-Interactions (CEI) Compliance
In `claimReward`, the user's pending reward balance is wiped to zero (`rewards[msg.sender] = 0;`) **prior** to running the low-level internal mint execution. This blocks state manipulation vectors and mitigates recursive reentrancy loop hazards.

---

## 📂 Folder Architecture

```text
defi-staking-protocol/
├── contracts/
│   ├── StakingRewards.sol       # Core Staking Logic & ERC-20 Reward Token
│   └── MockUSDT.sol             # Mock External ERC-20 Token for Local Testing
├── test/
│   └── StakingRewards.test.ts   # Strongly-Typed TypeScript Unit Tests
├── scripts/
│   └── deploy.ts                # Network Deployment Automation Script
├── typechain-types/             # Auto-Generated TypeScript Contract Interfaces
├── hardhat.config.ts            # Hardhat Compiler Configuration
└── README.md                    # System Documentation
```

---

## ⚙️ Mathematical Model & State Equations

### 1. Global Index Tracking
Whenever actions hit the contract, the global counter advances based on elapsed time and current liquidity saturation:
$$\text{RewardPerToken} = \text{StoredIndex} + \frac{\Delta\text{Time} \times \text{RewardRate} \times 10^{18}}{\text{TotalStaked}}$$

### 2. User Earnings Ledger
An individual account's accrued yield is calculated by evaluating the index variance since their last checkpoint:
$$\text{Earned} = \frac{\text{UserStakedBalance} \times \left(\text{CurrentGlobalIndex} - \text{UserLastPaidIndex}\right)}{10^{18}} + \text{SavedRewards}$$

---

## 💻 Local Installation & Testing Guide

### Prerequisites
Make sure you have **Node.js (v18.x or higher)** and **npm** installed on your workstation.

### 1. Clone & Initialize Environment
Clone the repository and install the standard dependencies, including TypeScript type wrappers and OpenZeppelin libraries:
```bash
git clone <your-repository-url>
cd defi-staking-protocol
npm install
```

### 2. Compile Contracts & Generate TypeScript Typings
Compile the Solidity files. The Typechain plugin will immediately map your smart contract APIs into strongly-typed TypeScript interfaces within the `typechain-types/` directory:
```bash
npx hardhat compile
```

### 3. Run Automated Unit Tests
Execute the local Mocha/Chai test suites to evaluate edge cases, validation boundaries, and EVM time-travel calculations:
```bash
npx hardhat test
```

### 4. Review Testing Coverage
Generate localized coverage matrix reports to verify that all functional statements and modifier paths are fully evaluated:
```bash
npx hardhat coverage
```

---

## 📄 License
This project is licensed under the **MIT License**.
