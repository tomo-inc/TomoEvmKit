import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { NetworkPopup } from '@tomo-wallet/uikit';
import { useNetworkOptions } from '../useNetworkOptions';

export interface ChainModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChainModal({ onClose, open }: ChainModalProps) {
  const { chainId } = useAccount();

  const networkOptions = useNetworkOptions();

  const selectedNetwork = useMemo(() => {
    return networkOptions.find((n) => n.id === chainId);
  }, [networkOptions, chainId]);

  if (!chainId) {
    return null;
  }

  return (
    <NetworkPopup
      opened={open}
      networkOptions={networkOptions}
      onClose={onClose}
      selectedNetwork={selectedNetwork}
    />
  );
}
