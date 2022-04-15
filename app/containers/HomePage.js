import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import tokenInterface from '../interfaces/Token.json';
import stakingInterface from '../interfaces/Staking.json';

//rpc mainnet https://polygon-rpc.com/
//rpc mumbai https://rpc-mumbai.matic.today

const tokenAddress = '0xC92D014d0D0590183c078660D0944d653297bB4F';
const stakingAddress = '0x5B55Fa515c3d9A3c36429c22b786c46F8c4E8e24';
let scope;

const defaultState = {
  balance: 0,
  stakedBalance: 0,
  daysRemaining: 0,
  currentBounty: 0,
  rewardsBalance: 0,
  stakeAmount: 0,
  staking: false,
};

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    scope = this;
    scope.state = { ...defaultState };
    const { provider } = props;
    scope.token = new ethers.Contract(
      tokenAddress,
      tokenInterface.abi,
      provider.getSigner()
    );
    scope.staking = new ethers.Contract(
      stakingAddress,
      stakingInterface.abi,
      provider.getSigner()
    );
    scope.init();
  }

  init() {
    scope.getBalance();
    scope.getStakedBalance();
    scope.getPeriodDay();
    scope.getCurrentBounty();
    scope.getRewardsBalance();
  }

  get now() {
    return Math.floor(Date.now() / 1000);
  }

  async getBalance() {
    const balance = await scope.token.balanceOf(scope.props.address);
    scope.setState({
      balance: ethers.utils.formatUnits(balance),
    });
  }

  async getStakedBalance() {
    const balance = await scope.staking.stakeBalanceOf(scope.props.address);
    scope.setState({
      stakedBalance: ethers.utils.formatUnits(balance),
    });
  }

  async getPeriodDay() {
    const periodRange = await scope.staking.periodRange();
    const day = await scope.staking.getCurrentPeriodDay(scope.now);
    scope.setState({
      daysRemaining: periodRange - day,
    });
  }

  async getCurrentBounty() {
    const bounty = await scope.staking.getCurrentBounty(scope.now);
    scope.setState({
      currentBounty: ethers.utils.formatUnits(bounty),
    });
  }

  async getRewardsBalance() {
    const balance = await scope.staking.rewardsBalanceOf(
      scope.props.address,
      scope.now
    );
    scope.setState({
      rewardsBalance: balance ? 0 : ethers.utils.formatUnits(balance),
    });
  }

  async stake() {
    const { stakeAmount } = scope.state;
    scope.setState({ staking: true });
    const txn = await scope.staking.stake(ethers.utils.parseUnits(stakeAmount));
    await txn.wait(1);
    scope.setState({ staking: false, stakeAmount: 0 });
    scope.getBalance();
    scope.getStakedBalance();
  }

  renderActions() {
    return (
      <>
        <div id='stake'>
          <h5>Stake in current period</h5>
          {scope.state.staking ? (
            <h4>...Staking {scope.state.stakeAmount}</h4>
          ) : (
            <>
              <input
                type='number'
                placeholder='amount'
                value={scope.state.stakeAmount}
                onChange={(e) =>
                  scope.setState({ stakeAmount: e.target.value })
                }
              />
              <button
                disabled={scope.state.staking}
                type='button'
                onClick={() => scope.stake()}
              >
                Stake
              </button>
            </>
          )}
        </div>
      </>
    );
  }

  render() {
    const {
      balance,
      stakedBalance,
      daysRemaining,
      currentBounty,
      rewardsBalance,
    } = scope.state;

    return (
      <>
        <div>
          <h5>Account Connected:</h5>
          {scope.props.address}
        </div>
        <div>
          <h5>Token Balance:</h5>
          {balance}
        </div>
        <div>
          <h5>Staked Balance:</h5>
          {stakedBalance}
        </div>
        <div>
          <h5>Days Remaining in Period:</h5>
          {daysRemaining}
        </div>
        <div>
          <h5>Bounty in this Period:</h5>
          {currentBounty}
        </div>
        <div>
          <h5>Your Rewards Balance:</h5>
          {rewardsBalance}
        </div>
        <hr />
        {scope.renderActions()}
      </>
    );
  }
}

HomePage.propTypes = {
  provider: PropTypes.object,
};
