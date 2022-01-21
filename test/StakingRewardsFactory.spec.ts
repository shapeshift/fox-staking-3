import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

import { expect } from "chai";
import { StakingRewardsFactory } from "../typechain-types/StakingRewardsFactory";
import { StakingRewards } from "../typechain-types/StakingRewards";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestERC20 } from "../typechain-types/TestERC20";

import StakingRewardsArtifact from "../artifacts/contracts/StakingRewards.sol/StakingRewards.json";
import { BigNumber } from "ethers";
import { expandTo18Decimals, mineBlock } from "./utils";
import { solidity } from "ethereum-waffle"; // needed for assertions

describe("StakingRewardsFactory", () => {
  let rewardsToken: TestERC20;
  let stakingToken: TestERC20;
  let accounts: SignerWithAddress[];
  let stakingRewardsFactory: StakingRewardsFactory;

  beforeEach(async () => {
    await deployments.fixture();
    accounts = await ethers.getSigners();
    const stakingFactoryDeployment = await deployments.get(
      "StakingRewardsFactory"
    );
    stakingRewardsFactory = new ethers.Contract(
      stakingFactoryDeployment.address,
      stakingFactoryDeployment.abi,
      accounts[0]
    ) as StakingRewardsFactory;

    const rewardsTokenDeployment = await deployments.get("RewardsToken");
    rewardsToken = new ethers.Contract(
      rewardsTokenDeployment.address,
      rewardsTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;

    const stakingTokenDeployment = await deployments.get("StakingToken");
    stakingToken = new ethers.Contract(
      stakingTokenDeployment.address,
      stakingTokenDeployment.abi,
      accounts[0]
    ) as TestERC20;
  });

  it("deployment gas [ @skip-on-coverage ]", async () => {
    const rewardsToken = await deployments.get("RewardsToken"); // mock fox token
    const contractFactory = await ethers.getContractFactory(
      "StakingRewardsFactory"
    );

    const stakingGenesis = Math.round(Date.now() / 1000 + 6000);
    const rewardsFactory = await contractFactory.deploy(
      rewardsToken.address,
      stakingGenesis
    );
    const tx = await rewardsFactory.deployed();
    const gasUsed = (await tx.deployTransaction.wait()).gasUsed;
    expect(gasUsed.toString()).to.eq("2155313");
  });

  describe("#deploy", () => {
    it("pushes the token into the list", async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000);
      expect(await stakingRewardsFactory.stakingTokens(0)).to.eq(
        stakingToken.address
      );
    });

    it("fails if called twice for same token", async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000);
      await expect(
        stakingRewardsFactory.deploy(stakingToken.address, 10000)
      ).to.be.revertedWith("StakingRewardsFactory::deploy: already deployed");
    });

    it("can only be called by the owner", async () => {
      await expect(
        stakingRewardsFactory
          .connect(accounts[1])
          .deploy(stakingToken.address, 10000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("stores the address of stakingRewards and reward amount", async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000);
      const stakingRewardsInfo =
        await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
          stakingToken.address
        );

      expect(stakingRewardsInfo.stakingRewards).to.not.eq(
        ethers.constants.AddressZero
      );
      expect(stakingRewardsInfo.rewardAmount).to.eq(10000);
    });

    it("deployed staking rewards has correct parameters", async () => {
      await stakingRewardsFactory.deploy(stakingToken.address, 10000);
      const stakingRewardsInfo =
        await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
          stakingToken.address
        );

      const stakingRewards = new ethers.Contract(
        stakingRewardsInfo.stakingRewards,
        StakingRewardsArtifact.abi,
        accounts[0]
      );

      expect(await stakingRewards.rewardsDistribution()).to.eq(
        stakingRewardsFactory.address
      );
      expect(await stakingRewards.stakingToken()).to.eq(stakingToken.address);
      expect(await stakingRewards.rewardsToken()).to.eq(rewardsToken.address);
    });
  });

  describe("#notifyRewardsAmounts", () => {
    it("called before any deploys", async () => {
      await expect(
        stakingRewardsFactory.notifyRewardAmounts()
      ).to.be.revertedWith(
        "StakingRewardsFactory::notifyRewardAmounts: called before any deploys"
      );
    });

    describe("after deploying all staking reward contracts", async () => {
      const nTokens = 4;
      const rewardAmountPerToken = expandTo18Decimals(1000); // 1000  tokens w/ 18 decimals
      const totalRewardAmount = rewardAmountPerToken.mul(nTokens);
      let stakingRewards: StakingRewards[];
      let stakingTokens: TestERC20[];
      let genesis: BigNumber;

      beforeEach("deploy staking reward contracts", async () => {
        const tokenFactory = await ethers.getContractFactory("TestERC20");
        const totalSupply = await stakingToken.totalSupply();
        genesis = await stakingRewardsFactory.stakingRewardsGenesis();
        stakingRewards = []; // reset array
        stakingTokens = [];
        for (let i = 0; i < nTokens; i++) {
          const newStakingToken = await tokenFactory.deploy(totalSupply);
          await newStakingToken.deployed();
          stakingTokens[i] = newStakingToken as TestERC20;

          await stakingRewardsFactory.deploy(
            newStakingToken.address,
            rewardAmountPerToken
          );
          const [stakingRewardsAddress] =
            await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
              stakingTokens[i].address
            );
          stakingRewards.push(
            new ethers.Contract(
              stakingRewardsAddress,
              StakingRewardsArtifact.abi,
              accounts[0]
            ) as StakingRewards
          );
        }
      });

      it("gas [ @skip-on-coverage ]", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        const tx = await stakingRewardsFactory.notifyRewardAmounts();
        const receipt = await tx.wait();
        expect(receipt.gasUsed).to.eq("486635");
      });

      it("no op if called twice", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        await expect(stakingRewardsFactory.notifyRewardAmounts()).to.emit(
          rewardsToken,
          "Transfer"
        );
        await expect(stakingRewardsFactory.notifyRewardAmounts()).to.not.emit(
          rewardsToken,
          "Transfer"
        );
      });

      it("fails if called without sufficient balance", async () => {
        await mineBlock(ethers.provider, genesis.toNumber());
        await expect(
          stakingRewardsFactory.notifyRewardAmounts()
        ).to.be.revertedWith(
          "ERC20: transfer amount exceeds balance" // emitted from rewards token
        );
      });

      it("calls notifyRewards on each contract", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        await expect(stakingRewardsFactory.notifyRewardAmounts())
          .to.emit(stakingRewards[0], "RewardAdded")
          .withArgs(rewardAmountPerToken)
          .to.emit(stakingRewards[1], "RewardAdded")
          .withArgs(rewardAmountPerToken)
          .to.emit(stakingRewards[2], "RewardAdded")
          .withArgs(rewardAmountPerToken)
          .to.emit(stakingRewards[3], "RewardAdded")
          .withArgs(rewardAmountPerToken);
      });

      it("transfers the reward tokens to the individual contracts", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        await stakingRewardsFactory.notifyRewardAmounts();
        for (let i = 0; i < nTokens; i++) {
          expect(await rewardsToken.balanceOf(stakingRewards[i].address)).to.eq(
            rewardAmountPerToken
          );
        }
      });

      it("sets rewardAmount to 0", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        for (let i = 0; i < stakingTokens.length; i++) {
          const [, amount] =
            await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
              stakingTokens[i].address
            );
          expect(amount).to.eq(rewardAmountPerToken);
        }
        await stakingRewardsFactory.notifyRewardAmounts();
        for (let i = 0; i < stakingTokens.length; i++) {
          const [, amount] =
            await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
              stakingTokens[i].address
            );
          expect(amount).to.eq(0);
        }
      });

      it("succeeds when has sufficient balance and after genesis time", async () => {
        await rewardsToken.transfer(
          stakingRewardsFactory.address,
          totalRewardAmount
        );
        await mineBlock(ethers.provider, genesis.toNumber());
        await stakingRewardsFactory.notifyRewardAmounts();
      });
    });
  });
});
