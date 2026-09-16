import type { BaseContract, ContractTransactionResponse } from "ethers";

export interface StakingRewards extends BaseContract {
    owner(): Promise<string>;
    stakingToken(): Promise<string>;
    rewardRate(): Promise<bigint>;
    rewardPerTokenStored(): Promise<bigint>;
    lastUpdateTime: Promise<bigint>;
    totalStaked: Promise<bigint>;

    balanceOfStaked(account: string): Promise<bigint>;
    rewards(account: string): Promise<bigint>;
    userRewardPerTokenPaid(account: string): Promise<bigint>;

    rewardPertoken(): Promise<bigint>;
    earned(account: string): Promise<bigint>;

    stake(amount: bigint, overrides?: any): Promise<ContractTransactionResponse>;
    withdraw(amount: bigint, overrides?: any): Promise<ContractTransactionResponse>;
    claimReward(overrides?: any): Promise<ContractTransactionResponse>;

}


export interface StakingRewardsInheritedERC20 {
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<bigint>;
    totalSupply(): Promise<bigint>;
    balanceOf(account: string): Promise<bigint>;
    allowance(owner: string, spender: string): Promise<bigint>;

    transfer(to: string, value: bigint): Promise<ContractTransactionResponse>;
    approve(spender: string, value: bigint): Promise<ContractTransactionResponse>;
    transferFrom(from: string, to: string, value: bigint): Promise<ContractTransactionResponse>;
}