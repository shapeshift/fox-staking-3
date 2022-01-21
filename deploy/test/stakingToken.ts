import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { expandTo18Decimals } from "../../test/utils";
import "hardhat-deploy";
import UniswapV2ERC20 from '@uniswap/v2-core/build/ERC20.json'

const func : DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();

  const totalSupply = expandTo18Decimals(1000000); // 1 million tokens w/ 18 decimals
  
  await deploy("StakingToken", {
    from: admin,
    contract: UniswapV2ERC20, 
    args: [totalSupply],
    log: true,
  });

};
export default func;
func.tags = ["StakingToken"];