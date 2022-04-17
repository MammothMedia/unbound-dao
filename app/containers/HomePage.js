import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import tokenInterface from '../interfaces/Token.json';
import stakingInterface from '../interfaces/Staking.json';
import { tokenAddress, stakingAddress } from '../config';

//rpc mainnet https://polygon-rpc.com/
//rpc mumbai https://rpc-mumbai.matic.today

let scope;

const defaultState = {
  // stats
  balance: 0,
  stakedBalance: 0,
  daysRemaining: 0,
  currentBounty: 0,
  rewardsBalance: 0,
  accountStatus: '',

  // actions
  unlockAccount: '',
  addAdmin: '',
  removeAdmin: '',
  bountyAmount: 0,
  stakeAmount: 0,
  unstakeAmount: 0,
  staking: false,
  unstaking: false,
  addingBounty: false,
  addingAdming: false,
  removingAdmin: false,
  unlockingAccount: false,
};

function commas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
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
    scope.getAccountStatus();
  }

  // return current PST time
  get now() {
    return Math.floor(Date.now() / 1000) - 60 * 60 * 8;
  }

  async getBalance() {
    const balance = await scope.token.balanceOf(scope.props.address);
    scope.setState({
      balance: ethers.utils.formatUnits(balance),
    });
  }

  async getAccountStatus() {
    const accountStatus = await scope.staking.lockoutStatus(
      scope.props.address
    );
    const periodAndDay = Number(accountStatus.toString());
    if (periodAndDay === 0) {
      return scope.setState({
        accountStatus: 'Unlocked',
      });
    }
    const periodRange = await scope.staking.periodRange();
    const day = periodAndDay % 1000;
    const period = (periodAndDay - day) / 10_000;
    const epoch = new Date(
      period * periodRange * 24 * 60 * 60 * 1000 + day * 24 * 60 * 60 * 1000
    );
    scope.setState({
      accountStatus: `Staking locked until ${epoch.toLocaleDateString()}`,
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
    try {
      const { stakeAmount } = scope.state;
      scope.setState({
        staking: true,
        disabled: true,
      });
      const txn = await scope.staking.stake(
        ethers.utils.parseUnits(stakeAmount)
      );
      await txn.wait(1);
      scope.getBalance();
      scope.getStakedBalance();
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      staking: false,
      stakeAmount: 0,
      disabled: false,
    });
  }

  async unstake() {
    try {
      const { unstakeAmount } = scope.state;
      scope.setState({
        disabled: true,
        unstaking: true,
      });
      const txn = await scope.staking.unstake(
        ethers.utils.parseUnits(unstakeAmount)
      );
      await txn.wait(1);
      scope.getBalance();
      scope.getStakedBalance();
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      disabled: false,
      unstakeAmount: 0,
      unstaking: false,
    });
  }

  async addBounty() {
    try {
      const { bountyAmount } = scope.state;
      scope.setState({
        disabled: true,
        addingBounty: true,
      });
      const txn = await scope.staking.addBounty(
        ethers.utils.parseUnits(bountyAmount)
      );
      await txn.wait(1);
      scope.getBalance();
      scope.getCurrentBounty();
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      disabled: false,
      bountyAmount: 0,
      addingBounty: false,
    });
  }

  async addAdmin() {
    try {
      const { addAdmin } = scope.state;
      let account;
      try {
        account = ethers.utils.getAddress(addAdmin);
      } catch (err) {
        alert('Invalid Address');
        return;
      }
      scope.setState({
        disabled: true,
        addingAdmin: true,
      });
      const txn = await scope.staking.addAdmin(account);
      await txn.wait(1);
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      disabled: false,
      addAdmin: '',
      addingAdmin: false,
    });
  }

  async removeAdmin() {
    try {
      const { removeAdmin } = scope.state;
      let account;
      try {
        account = ethers.utils.getAddress(removeAdmin);
      } catch (err) {
        alert('Invalid Address');
        return;
      }
      scope.setState({
        disabled: true,
        removingAdmin: true,
      });
      const txn = await scope.staking.removeAdmin(account);
      await txn.wait(1);
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      disabled: false,
      removeAdmin: '',
      removingAdmin: false,
    });
  }

  async unlockAccount() {
    try {
      const { unlockAccount } = scope.state;
      let account;
      try {
        account = ethers.utils.getAddress(unlockAccount);
      } catch (err) {
        alert('Invalid Address');
        return;
      }
      scope.setState({
        disabled: true,
        unlockingAccount: true,
      });
      const txn = await scope.staking.unlockAccount(account);
      await txn.wait(1);
    } catch (err) {
      alert('Error occurred');
      console.error(err);
    }
    scope.setState({
      disabled: false,
      unlockAccount: '',
      unlockingAccount: false,
    });
  }

  renderAdminActions() {
    return (
      <div className='group'>
        <h3>Admin Features</h3>
        <div id='add-admin' className='action'>
          <h5>Add Admin</h5>
          {scope.state.addingAdmin ? (
            <h6>...Adding</h6>
          ) : (
            <div className='form-group'>
              <input
                type='text'
                className='form-control'
                placeholder='address'
                value={scope.state.addAdmin}
                onChange={(e) => scope.setState({ addAdmin: e.target.value })}
              />
              <button
                disabled={scope.state.addingAdming || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.addAdmin()}
              >
                Add
              </button>
            </div>
          )}
        </div>
        <div id='remove-admin' className='action'>
          <h5>Remove Admin</h5>
          {scope.state.removingAdmin ? (
            <h6>...Removing</h6>
          ) : (
            <div className='form-group'>
              <input
                type='text'
                className='form-control'
                placeholder='address'
                value={scope.state.removeAdmin}
                onChange={(e) =>
                  scope.setState({ removeAdmin: e.target.value })
                }
              />
              <button
                disabled={scope.state.removingAdmin || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.removeAdmin()}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <div id='unlock-admin' className='action'>
          <h5>Unlock Account</h5>
          {scope.state.unlockingAccount ? (
            <h6>...Unlocking</h6>
          ) : (
            <div className='form-group'>
              <input
                type='text'
                className='form-control'
                placeholder='address'
                value={scope.state.unlockAccount}
                onChange={(e) =>
                  scope.setState({ unlockAccount: e.target.value })
                }
              />
              <button
                disabled={scope.state.unlockingAccount || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.unlockAccount()}
              >
                Unlock
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderActions() {
    return (
      <div className='group'>
        <h3>User Features</h3>
        <div id='stake' className='action'>
          <h5>Stake in current period</h5>
          {scope.state.staking ? (
            <h6>...Staking {scope.state.stakeAmount}</h6>
          ) : (
            <div className='form-group'>
              <input
                type='number'
                className='form-control'
                placeholder='amount'
                value={scope.state.stakeAmount}
                onChange={(e) =>
                  scope.setState({ stakeAmount: e.target.value })
                }
              />
              <button
                disabled={scope.state.staking || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.stake()}
              >
                Stake
              </button>
            </div>
          )}
        </div>

        <div id='unstake' className='action'>
          <h5>Unstake</h5>
          {scope.state.unstaking ? (
            <h6>...Unstaking {scope.state.unstakeAmount}</h6>
          ) : (
            <div className='form-group'>
              <input
                type='number'
                className='form-control'
                placeholder='amount'
                value={scope.state.unstakeAmount}
                onChange={(e) =>
                  scope.setState({ unstakeAmount: e.target.value })
                }
              />
              <button
                disabled={scope.state.unstaking || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.unstake()}
              >
                Unstake
              </button>
            </div>
          )}
        </div>

        <div id='add-bounty' className='action'>
          <h5>Add Bounty</h5>
          {scope.state.addingBounty ? (
            <h6>...Adding Bounty {scope.state.bountyAmount}</h6>
          ) : (
            <div className='form-group'>
              <input
                type='number'
                className='form-control'
                placeholder='amount'
                value={scope.state.bountyAmount}
                onChange={(e) =>
                  scope.setState({ bountyAmount: e.target.value })
                }
              />
              <button
                disabled={scope.state.addingBounty || scope.state.disabled}
                type='button'
                className='btn btn-primary'
                onClick={() => scope.addBounty()}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const {
      balance,
      stakedBalance,
      daysRemaining,
      currentBounty,
      rewardsBalance,
      accountStatus,
    } = scope.state;

    return (
      <>
        <div id='stats'>
          <div>
            <h5>Connected Account</h5>
            {scope.props.address}
          </div>
          <div>
            <h5>Token Balance</h5>
            {commas(balance)}
          </div>
          <div>
            <h5>Staked Balance</h5>
            {commas(stakedBalance)}
          </div>
          <div>
            <h5>Days Remaining in Period</h5>
            {daysRemaining}
          </div>
          <div>
            <h5>Bounty in this Period</h5>
            {commas(currentBounty)}
          </div>
          <div>
            <h5>Your Rewards Balance</h5>
            {commas(rewardsBalance)}
          </div>
          <div>
            <h5>Account Status</h5>
            {accountStatus}
          </div>
        </div>
        <div id='actions'>
          {scope.renderActions()}
          {scope.renderAdminActions()}
        </div>
      </>
    );
  }
}

HomePage.propTypes = {
  provider: PropTypes.object,
};
