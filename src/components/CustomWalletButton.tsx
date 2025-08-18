import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface CustomWalletButtonProps {
  className?: string;
}

export const CustomWalletButton: React.FC<CustomWalletButtonProps> = ({ className }) => {
  const { publicKey, disconnect } = useWallet();

  const walletAddress = useMemo(() => {
    if (!publicKey) return '';
    return publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4);
  }, [publicKey]);

  return (
    <div className={`relative z-50 ${className || ''}`}>
      <WalletMultiButton className="wallet-adapter-button-trigger !bg-transparent" />
      
      {/* Custom dropdown menu for connected wallet */}
      {publicKey && (
        <div className="wallet-adapter-dropdown absolute right-0 top-full mt-2 z-50">
          <ul className="wallet-adapter-dropdown-list">
            <li className="wallet-adapter-dropdown-list-item">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
            </li>
            <li className="wallet-adapter-dropdown-list-item">
              <div className="flex items-center justify-between">
                <span className="text-sm">Address:</span>
                <span className="text-sm font-mono text-gray-300">{walletAddress}</span>
              </div>
            </li>
            <li className="wallet-adapter-dropdown-list-item">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicKey.toString());
                }}
                className="w-full text-left text-sm hover:text-blue-300 transition-colors"
              >
                📋 Copy Address
              </button>
            </li>
            <li className="wallet-adapter-dropdown-list-item">
              <button
                onClick={() => disconnect()}
                className="w-full text-left text-sm hover:text-red-300 transition-colors"
              >
                🚪 Disconnect
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
