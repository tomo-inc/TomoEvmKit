import React, { useMemo } from 'react';
import {
  useAccount,
  useChainId,
  // useChains,
  // useConnections,
  // useConnectors,
  useDisconnect,
  // useSwitchChain,
} from 'wagmi';
// import { useProfile } from '../../hooks/useProfile';
// import { Dialog } from '../Dialog/Dialog';
// import { DialogContent } from '../Dialog/DialogContent';
// import { ProfileDetails } from '../ProfileDetails/ProfileDetails';
import { ConnectedModal, Theme } from '@tomo-wallet/uikit';
import { useRainbowKitChains } from '../RainbowKitProvider/RainbowKitChainContext';
import { AsyncImage } from '../AsyncImage/AsyncImage';
// import { useThemeRootProps } from '../RainbowKitProvider/RainbowKitProvider';

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function AccountModal({ onClose, open }: AccountModalProps) {
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const rainbowKitChains = useRainbowKitChains();
  // const { switchChainAsync } = useSwitchChain();
  // const connections = useConnections();
  // const { balance, ensAvatar, ensName } = useProfile({
  //   address,
  //   includeBalance: open,
  // });
  const { disconnect } = useDisconnect();

  // const titleId = 'rk_account_modal_title';

  const selectedNetwork = useMemo(() => {
    const rbChain = rainbowKitChains.find((rc) => rc.id === chainId);
    return {
      id: chainId,
      name: rbChain?.name || '',
      logo: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 24,
            height: 24,
          }}
        >
          <AsyncImage src={rbChain?.iconUrl || ''} fullWidth fullHeight />
        </div>
      ),
    };
  }, [rainbowKitChains, chainId]);

  const networkOptions = useMemo(() => {
    return rainbowKitChains.map((rc) => ({
      id: rc.id,
      name: rc.name,
      logo: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 32,
            height: 32,
          }}
        >
          <AsyncImage src={rc?.iconUrl || ''} fullWidth fullHeight />
        </div>
      ),
    }));
  }, [rainbowKitChains]);

  if (!address) {
    return null;
  }

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
        iconSrc: connector?.icon || (connector?.iconUrl as string) || '',
      }}
      onNetworkSwitch={async () => {
        console.log('switch');
      }}
      close
    />
  );
  // return (
  //   <>
  //     {address && (
  //       <Dialog onClose={onClose} open={open} titleId={titleId}>
  //         <DialogContent bottomSheetOnMobile padding="0">
  //           <ProfileDetails
  //             address={address}
  //             ensAvatar={ensAvatar}
  //             ensName={ensName}
  //             balance={balance}
  //             onClose={onClose}
  //             onDisconnect={disconnect}
  //           />
  //         </DialogContent>
  //       </Dialog>
  //     )}
  //   </>
  // );
}
