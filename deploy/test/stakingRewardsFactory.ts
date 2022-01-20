import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const stakingGenesis = Math.floor(Date.now() / 1000 + 60 * 5) // No more than 5 minutes in the future
  const { admin } = await getNamedAccounts();

  const rewardsToken = await deployments.get("RewardsToken"); // mock fox token

  await deploy("StakingRewardsFactory", {
    from: admin,
    args: [rewardsToken.address, stakingGenesis],
    log: true,
  });
};
export default func;
func.dependencies = ["RewardsToken"];
func.tags = ["StakingRewardsFactory"];