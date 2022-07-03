// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GSTCoin is ERC20, Ownable {
    mapping(address => bool) public isClaimed;
    mapping(address => bool) private _admin;

    bool public claimEnabled = true;

    constructor(uint256 initialSupply) ERC20("gstcoin", "GST") {}

    modifier onlyAdmin() {
        require(_admin[msg.sender] == true, "must be admin.");
        _;
    }

    function mint(address account, uint256 amount) external onlyAdmin {
        _mint(account, amount);
    }

    function claim() external {
        require(claimEnabled, "claim disabled");
        require(isClaimed[msg.sender] != true, "already claimed");
        isClaimed[msg.sender] = true;
        _mint(msg.sender, 100);
    }

    function setAdmin(address admin) external onlyOwner {
        _admin[admin] = true;
    }

    function removeAdmin(address admin) external onlyOwner {
        _admin[admin] = false;
    }
}
