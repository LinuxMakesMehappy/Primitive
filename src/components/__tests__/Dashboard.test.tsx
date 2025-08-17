import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from '../Dashboard';

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

describe('Dashboard Component', () => {
  test('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Primitive Protocol/i)).toBeInTheDocument();
  });

  test('shows connect wallet button when not connected', () => {
    render(<Dashboard />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
