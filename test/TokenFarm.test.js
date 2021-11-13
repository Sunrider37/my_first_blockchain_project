const { assert } = require('chai');

/* eslint-disable no-undef */
const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

require('chai')
    .use(require('chai-as-promised')).should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm
    before(async () => {
       
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)


        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })
    
    describe('Mock Dai deployment', async () => {
        it('has a name', async () => {
            let daiToken = await DaiToken.new()
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('DApp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming Tokens', async() => {
        it('rewards investors for staking mDai tokens', async () => {
            let result;

            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'))

            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), { from: investor})
            result = await daiToken.balanceOf(investor)

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true',  'investor Mock DAi wallet balance correct')

            await tokenFarm.issueTokens({from: owner})

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 
            'investor DApp Token Wallet balance correct after issuance')

            await tokenFarm.issueTokens({from: investor}).should.be.rejected;
           
            await tokenFarm.unstakeTokens({from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'))

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'))

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'))

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct')
        })
    })
}) 