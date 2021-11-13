pragma solidity >0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address[] public stakers;
    address public owner;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1.Staking tokens
    function stakeTokens (uint _amount) public {
        daiToken.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add users to stakers array only if they have not staked already

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
    // 2 Unstacking tokens

    // 3 Isssing tokens

    function issueTokens () public {
        require(msg.sender == owner, "Caller must be the owner");

        for(uint i=0; i < stakers.length ; i++){
                address recepient = stakers[i];
                uint balance = stakingBalance[recepient];
                if(balance > 0 ){
                dappToken.transfer(recepient, balance);
                }
        }
    }

    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");

        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender ] = false;
    }
}