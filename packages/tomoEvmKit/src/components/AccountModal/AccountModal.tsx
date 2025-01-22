import React, { useMemo } from 'react';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { ConnectedModal, Theme } from '@tomo-wallet/uikit';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { useNetworkOptions } from '../useNetworkOptions';

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function AccountModal({ onClose, open }: AccountModalProps) {
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  const networkOptions = useNetworkOptions();

  const selectedNetwork = useMemo(() => {
    const network = networkOptions.find((rc) => rc.id === chainId);
    return {
      id: chainId,
      name: network?.name || '',
      logo: network?.logo,
    };
  }, [networkOptions, chainId]);

  if (!address) {
    return null;
  }

  const iconSrc =
    connector?.icon ||
    (connector?.iconUrl as string) ||
    (connector?.rkDetails as any)?.iconUrl ||
    '';

  return (
    <ConnectedModal
      opened={open}
      onClose={onClose}
      title="Connected Modal"
      theme={Theme.LIGHT}
      onLogout={disconnect}
      selectedNetwork={selectedNetwork}
      networkOptions={networkOptions}
      accountInfo={{
        address,
        name: connector?.name || '',
        icon: (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <AsyncImage src={iconSrc} fullHeight fullWidth />
          </div>
        ),
      }}
      onNetworkSwitch={async () => {
        console.log('switch');
      }}
      close
    />
  );
}
