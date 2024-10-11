import React from "react";

function Header({ walletConnected, account, balance }) {
  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Minesweeper Game</h1>
      {walletConnected && (
        <div className="flex items-center space-x-4">
          <div className="text-gray-700">
            Balance: <span className="font-semibold">{balance} ETH</span>
          </div>
          <div className="text-gray-700">
            Account: <span className="font-semibold">{account}</span>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
