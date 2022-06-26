async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  // const Ghosts = await ethers.getContractFactory('Ghosts');
  // const ghotst = await Ghosts.deploy();

  const Verifier = await ethers.getContractFactory('Verifier');
  const verifier = await Verifier.deploy();

  console.log('Verifier address:', verifier.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
