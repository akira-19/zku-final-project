const { poseidonContract } = require('circomlibjs');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const PoseidonT3 = await ethers.getContractFactory(
    poseidonContract.generateABI(2),
    poseidonContract.createCode(2),
  );
  const poseidonT3 = await PoseidonT3.deploy();
  await poseidonT3.deployed();

  const Verifier = await ethers.getContractFactory('Verifier');
  const verifier = await Verifier.deploy();

  console.log('Verifier address:', verifier.address);

  const GstCoin = await ethers.getContractFactory('GSTCoin');
  const gstCoin = await GstCoin.deploy(10000);

  console.log('GSTCoin address:', gstCoin.address);

  const Ghosts = await ethers.getContractFactory('Ghosts', {
    libraries: {
      PoseidonT3: poseidonT3.address,
    },
  });
  const ghosts = await Ghosts.deploy(verifier.address, gstCoin.address);

  console.log('Ghosts address:', ghosts.address);

  await gstCoin.setAdmin(ghosts.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
