// biome-ignore lint/style/useImportType: <explanation>
import React, { useState } from 'react';
import { useEffect, useMemo } from 'react';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { ConnectedModal, Theme } from '@tomo-wallet/uikit';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { useNetworkOptions } from '../useNetworkOptions';
import type { EthereumProvider } from '@tomo-inc/social-wallet-sdk';
import {
  readSocialLoginType,
  writeSocialLoginType,
} from '../ConnectModal/socialLoginTypeSL';
import type { LoginType } from '@tomo-inc/social-wallet-sdk/dist/types/types';
import googleIcon from '../../../assets/icon_google.svg';
import xIcon from '../../../assets/icon_x.svg';
import kakaoIcon from '../../../assets/icon_kakao.svg';
import tgIcon from '../../../assets/icon_telegram.svg';
import emailIcon from '../../../assets/icon_email.svg';
import { IconImg } from '../IconImg';

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const loginTypeIcon: Record<
  LoginType | 'email',
  React.JSX.Element | undefined
> = {
  google: <IconImg width={22} height={22} src={googleIcon} alt="google" />,
  twitter: <IconImg width={22} height={22} src={xIcon} alt="x" />,
  kakao: <IconImg width={22} height={22} src={kakaoIcon} alt="kakao" />,
  telegram: <IconImg width={22} height={22} src={tgIcon} alt="telegram" />,
  email: undefined,
};

export function AccountModal({ onClose, open }: AccountModalProps) {
  const { address, connector, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const [loginType, setLoginType] = useState('');

  const networkOptions = useNetworkOptions();

  const selectedNetwork = useMemo(() => {
    const network = networkOptions.find((rc) => rc.id === chainId);
    return {
      id: chainId,
      name: network?.name || '',
      logo: network?.logo,
    };
  }, [networkOptions, chainId]);

  const connectorName = connector?.name;
  const showSetting = connectorName === 'Tomo Wallet';

  const iconSrc =
    connector?.icon ||
    (connector?.iconUrl as string) ||
    (connector?.rkDetails as any)?.iconUrl ||
    '';

  // biome-ignore lint/correctness/useExhaustiveDependencies: when connect status change
  useEffect(() => {
    const type = readSocialLoginType();
    if (type) setLoginType(type);
  }, [isConnected]);

  const LoginTypeIcon = (loginTypeIcon as any)[loginType];

  if (!address) {
    return null;
  }

  return (
    <ConnectedModal
      opened={open}
      onClose={onClose}
      title="Connected Modal"
      theme={Theme.LIGHT}
      onLogout={() => {
        disconnect();
        /** set login type to empty here if applicable */
        const loginType = readSocialLoginType();
        if (loginType) writeSocialLoginType('');
      }}
      selectedNetwork={selectedNetwork}
      networkOptions={networkOptions}
      onChangePayPin={async () => {
        const provider = (await connector?.getProvider()) as EthereumProvider;
        provider?.core.changePayPin();
      }}
      showSetting={showSetting}
      accountInfo={{
        address,
        name: connector?.name || '',
        icon: (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              position: 'relative',
            }}
          >
            <AsyncImage src={iconSrc} fullHeight fullWidth />
            {!!LoginTypeIcon && (
              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -3,
                  borderRadius: '50%',
                  background: 'white',
                  width: 22,
                  height: 22,
                }}
              >
                {LoginTypeIcon}
              </div>
            )}
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
