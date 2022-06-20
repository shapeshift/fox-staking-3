import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
require('dotenv').config()


const func : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const stakingGenesis = Math.floor(Date.now() / 1000 + 60 * 60 * 24) // 24 hours in future
  const { admin } = await getNamedAccounts();
  await deploy("StakingRewardsFactory", {
    from: admin,
    args: [process.env.REWARD_TOKEN, stakingGenesis],
    log: true,
  });
};
export default func;
func.tags = ["StakingRewardsFactory"];
