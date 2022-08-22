import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';


// Constants
const TWITTER_HANDLE = 'ras_kimonic';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    // users can have multiple authorised accounts
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  }
} catch (error) {
  console.log(error);
  }
  setIsLoading(false);
};


// Render Methods
const renderContent = () => {
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // scenario #1: user has not yet connected to app
  // show connect wallet button
  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
            <img
              src="https://forum.malazanempire.com/uploads/monthly_03_2013/post-1903-0-79443100-1362564117.gif"
              alt="Malazan negroes"
            />
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
          </div>
    );
  // scenario #2: user has connected to app AND does not have a character NFT 
} else if (currentAccount && !characterNFT) {
  return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    // scenario #3: there is a connected wallet and characterNFT, it's time to battle buhari
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} />;
  }
};

const connectWalletAction = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert('Get MetaMask!');
      return;
    }
const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);


  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      setIsLoading(false);
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);



  const checkNetwork = async () => {
    try { 
      if (window.ethereum.networkVersion !== '80001') {
        alert("Please connect to Mumbai!")
      }
    } catch(error) {
      console.log(error)
    }
  }

















  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Malazan Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Empire!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
