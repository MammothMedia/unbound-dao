'use strict';

import React, { Component } from 'react';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
//import Header from '../components/Header';
//import Footer from '../components/Footer';
import HomePage from '../containers/HomePage';
import { googleTrackingId, isProduction } from '../config';
import { debounce, getWindowWidth, addClass, removeClass } from '../utils';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';

let scope;
const defaultState = {
  error: '',
  loading: false,
  device: false,
  provider: '',
  metamaskMissing: false,
  isMumbai: false,
  address: '',
  web3: null,
};

class App extends Component {
  constructor(props) {
    super(props);
    scope = this;
    scope.history = props.history;
    scope.location = props.location;
    scope.state = {
      ...defaultState,
    };
    // Add device to body if window is less than a specific size
    scope.detectDevice = debounce(() => {
      const body = document.body;
      if (getWindowWidth() < 768) {
        if (!scope.state.device) {
          addClass('device', body);
          scope.setState({ device: true });
        }
      } else {
        if (scope.state.device) {
          removeClass('device', body);
          scope.setState({ device: false });
        }
      }
    });
    window.addEventListener('resize', scope.detectDevice);
    scope.detectDevice();

    // initialize google analytics
    if (isProduction) {
      window.gtag('config', googleTrackingId);
    }
    scope.getProvider();
  }

  async getProvider() {
    const metamask = await detectEthereumProvider();

    if (metamask) {
      ethereum.on('chainChanged', (_chainId) => window.location.reload());
      // this will get moved to app
      const provider = new ethers.providers.Web3Provider(metamask);
      await provider.send('eth_requestAccounts', []);
      // switch to Mumbai if not active
      if (ethereum.chainId !== '0x13881') {
        scope.setState({ isMumbai: false });
        await provider.send('wallet_switchEthereumChain', [
          { chainId: '0x13881' },
        ]);
      } else {
        scope.setState({
          isMumbai: true,
          provider,
          address: ethereum.selectedAddress,
        });
      }
    } else {
      scope.setState({
        metamaskMissing: true,
      });
    }
  }
  getMainRoutes() {
    return (
      <div id='content'>
        <Switch>
          <Route
            path='/'
            render={(props) => (
              <HomePage
                provider={scope.state.provider}
                address={scope.state.address}
                {...props}
              />
            )}
          />
          <Redirect to='/' />
        </Switch>
      </div>
    );
  }

  render() {
    let content = null;
    const { state } = scope;
    content = scope.getMainRoutes();

    if (state.loading) {
      return (
        <div className='spinner'>
          <div className='dot1' />
          <div className='dot2' />
        </div>
      );
    }

    if (!state.isMumbai) {
      return <h5>Please approve Metamask to switch to the Mumbai Network</h5>;
    }
    return <>{content}</>;
  }
}

App.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default withRouter(App);
