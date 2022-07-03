// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

interface IGSTCoin {
    function mint(address account, uint256 amount) external;

    function claim() external;

    function setAdmin(address admin) external;

    function removeAdmin(address admin) external;
}
