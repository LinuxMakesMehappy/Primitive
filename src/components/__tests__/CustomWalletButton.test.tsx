import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CustomWalletButton } from '../CustomWalletButton';

// Mock the wallet adapter components
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    publicKey: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletMultiButton: () => <button>Connect Wallet</button>,
}));

describe('CustomWalletButton Component', () => {
  test('renders without crashing', () => {
    render(<CustomWalletButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    render(<CustomWalletButton className="custom-class" />);
    const button = screen.getByText('Connect Wallet');
    expect(button).toBeInTheDocument();
  });
});
