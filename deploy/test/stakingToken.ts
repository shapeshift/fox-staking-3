import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { expandTo18Decimals } from "../../test/utils";

import TestERC20Path from '../../artifacts/contracts/test/TestERC20.sol/TestERC20.json';

const func : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();

  const totalSupply = expandTo18Decimals(1000000); // 1 million tokens w/ 18 decimals
  
  await deploy("StakingToken", {
    from: admin,
    contract: TestERC20Path, 
    args: [totalSupply],
    log: true,
  });

};
export default func;
func.tags = ["StakingToken"];