import React from 'react';

export default React.createContext({
  wallet: {
    
  },
  deductAmount: (amount) => { },
  updateSelectedPortfolio: (portfolio) => { },
  selectedPortfolio: null,
  updateSelectedPortfolioData: (portfolioData) => { },
  addWalletAmount: (amount) => { },
});