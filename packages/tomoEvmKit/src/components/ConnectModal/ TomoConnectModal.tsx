import React from 'react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Popup,
  PopupHeader,
  ConnectMain,
  type WalletItemProps,
  HeaderBackIcon,
  HeaderCloseIcon,
} from '@tomo-wallet/uikit';
import { WalletButtonContext } from '../RainbowKitProvider/WalletButtonContext';
import {
  useWalletConnectors,
  type WalletConnector,
} from '../../wallets/useWalletConnectors';
import { addLatestWalletId } from '../../wallets/latestWalletId';
import { WalletStep } from '../ConnectOptions/DesktopOptions';
import { isSafari } from '../../utils/browsers';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import {
  ConnectDetail,
  DownloadDetail,
  DownloadOptionsDetail,
  GetDetail,
  InstructionDesktopDetail,
  InstructionExtensionDetail,
  InstructionMobileDetail,
} from '../ConnectOptions/ConnectDetails';
import { i18n } from '../../locales';
import { ConnectModalIntro } from './ConnectModalIntro';
import { Box } from '../Box/Box';
import { Text } from '../Text/Text';
import googleIcon from '../../../assets/icon_google.svg';
import xIcon from '../../../assets/icon_x.svg';
import kakaoIcon from '../../../assets/icon_kakao.svg';
import tgIcon from '../../../assets/icon_telegram.svg';
import type { EthereumProvider } from '@tomo-inc/social-wallet-sdk';
import {
  ThemeTypeContext,
  useThemeRootProps,
} from '../RainbowKitProvider/RainbowKitProvider';
import type {
  LoginType,
  UserSocialInfo,
} from '@tomo-inc/social-wallet-sdk/dist/types/types';
import { connectMobile } from './connectMobile';
import { isMobile } from '../../utils/isMobile';
import { writeSocialLoginType } from './socialLoginTypeSL';
import { IconImg } from '../IconImg';

interface Props {
  opened: boolean;
  onClose: () => any;
}

export function TomoConnectModalInner({ opened, onClose }: Props) {
  const [selectedWallet, setSelectedWallet] = useState<WalletConnector>();
  const [qrCodeUri, setQrCodeUri] = useState<string>();
  const hasQrCode = !!selectedWallet?.qrCode && qrCodeUri;
  const [connectionError, setConnectionError] = useState(false);
  const safari = isSafari();

  const initialized = useRef(false);

  const { connector } = useContext(WalletButtonContext);

  // The `WalletButton` component made the connect modal appear empty when trying to connect.
  // This happened because of a mix up between EIP-6963 and RainbowKit connectors.
  // The problem was finding the correct `wallet.id`. `WalletButton` uses RainbowKit's id,
  // but EIP-6963 uses `rdns` for its id. We now don't merge EIP-6963 and RainbowKit
  // connectors if user interacts with `WalletButton` component.
  const mergeEIP6963WithRkConnectors = !connector;

  const wallets = useWalletConnectors(mergeEIP6963WithRkConnectors)
    .filter((wallet) => wallet.ready || !!wallet.extensionDownloadUrl)
    .sort((a, b) => a.groupIndex - b.groupIndex);

  const unfilteredWallets = useWalletConnectors();

  // const groupedWallets = groupBy(wallets, (wallet) => wallet.groupName);

  // const supportedI18nGroupNames = [
  //   'Recommended',
  //   'Other',
  //   'Popular',
  //   'More',
  //   'Others',
  //   'Installed',
  // ];

  // If a user hasn't installed the extension we will get the
  // qr code with additional steps on how to get the wallet
  useEffect(() => {
    if (connector && !initialized.current) {
      changeWalletStep(WalletStep.Connect);
      selectWallet(connector);
      initialized.current = true;
    }
  }, [connector]);

  const connectToWallet = (wallet: WalletConnector) => {
    setConnectionError(false);
    if (wallet.ready) {
      wallet?.connect?.()?.catch(() => {
        setConnectionError(true);
      });
    }
  };

  const onDesktopUri = async (wallet: WalletConnector) => {
    const sWallet = wallets.find((w) => wallet.id === w.id);

    if (!sWallet?.getDesktopUri) return;

    setTimeout(async () => {
      const uri = await sWallet?.getDesktopUri?.();
      if (uri) window.open(uri, safari ? '_blank' : '_self');
    }, 0);
  };

  const onQrCode = async (wallet: WalletConnector) => {
    const sWallet = wallets.find((w) => wallet.id === w.id);

    const uri = await sWallet?.getQrCodeUri?.();

    setQrCodeUri(uri);

    // This timeout prevents the UI from flickering if connection is instant,
    // otherwise users will see a flash of the "connecting" state.
    setTimeout(
      () => {
        setSelectedWallet(sWallet);
        changeWalletStep(WalletStep.Connect);
      },
      uri ? 0 : 50,
    );
  };

  const selectWallet = async (wallet: WalletConnector) => {
    // We still want to get the latest wallet id to show connected
    // green badge on our custom WalletButton API
    addLatestWalletId(wallet.id);

    // This ensures that we listen to the provider.once("display_uri")
    // before connecting to the wallet
    if (wallet.ready) {
      onQrCode(wallet);
      onDesktopUri(wallet);
    }

    connectToWallet(wallet);
    // setSelectedOptionId(wallet.id);

    if (!wallet.ready) {
      setSelectedWallet(wallet);
      changeWalletStep(
        wallet?.extensionDownloadUrl
          ? WalletStep.DownloadOptions
          : WalletStep.Connect,
      );
    }
  };

  const getWalletDownload = (id: string) => {
    const sWallet = unfilteredWallets.find((w) => id === w.id);
    const isMobile = sWallet?.downloadUrls?.qrCode;
    const isDesktop = !!sWallet?.desktopDownloadUrl;
    const isExtension = !!sWallet?.extensionDownloadUrl;
    setSelectedWallet(sWallet);
    if (isMobile && (isExtension || isDesktop)) {
      changeWalletStep(WalletStep.DownloadOptions);
    } else if (isMobile) {
      changeWalletStep(WalletStep.Download);
    } else if (isDesktop) {
      changeWalletStep(WalletStep.InstructionsDesktop);
    } else {
      changeWalletStep(WalletStep.InstructionsExtension);
    }
  };

  const clearSelectedWallet = () => {
    // setSelectedOptionId(undefined);
    setSelectedWallet(undefined);
    setQrCodeUri(undefined);
  };
  const changeWalletStep = (newWalletStep: WalletStep, isBack = false) => {
    if (
      isBack &&
      newWalletStep === WalletStep.Get &&
      initialWalletStep === WalletStep.Get
    ) {
      clearSelectedWallet();
    } else if (!isBack && newWalletStep === WalletStep.Get) {
      setInitialWalletStep(WalletStep.Get);
    } else if (!isBack && newWalletStep === WalletStep.Connect) {
      setInitialWalletStep(WalletStep.Connect);
    }
    setWalletStep(newWalletStep);
  };
  const [initialWalletStep, setInitialWalletStep] = useState<WalletStep>(
    WalletStep.None,
  );
  const [walletStep, setWalletStep] = useState<WalletStep>(WalletStep.None);

  let walletContent = null;
  let headerLabel = null;
  let headerBackButtonLink: WalletStep | null = null;
  let headerBackButtonCallback: () => void;

  // biome-ignore lint/correctness/useExhaustiveDependencies: expected use to re-render when step changes
  useEffect(() => {
    setConnectionError(false);
  }, [walletStep, selectedWallet]);

  const hasExtension = !!selectedWallet?.extensionDownloadUrl;
  const hasExtensionAndMobile = !!(
    hasExtension && selectedWallet?.mobileDownloadUrl
  );

  const [walletOptions, setWalletOptions] = useState<WalletItemProps[]>([]);

  const tomoWallet = useMemo(
    () => wallets.find((w) => w.id === 'TomoWallet'),
    [wallets],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: on mount logic
  useEffect(() => {
    let walletOpts: (WalletItemProps & { wallet: WalletConnector })[] = wallets
      .filter((w) => !isMobile() || w.ready)
      .map((w) => {
        let desc = '';
        if (w.installed || w.groupName === 'Installed') desc = 'Installed';
        else {
          const platformList = [];
          if (w.downloadUrls?.browserExtension) platformList.push('Extension');
          if (w.downloadUrls?.android || w.downloadUrls?.ios)
            platformList.push('App');
          desc = platformList.join(' & ');
        }
        return {
          key: w.id,
          name: w.name,
          desc,
          icon: (
            <div
              style={{
                borderRadius: 10,
                width: 48,
                height: 48,
                overflow: 'hidden',
              }}
            >
              <AsyncImage
                background={'transparent'}
                useAsImage={!w.isRainbowKitConnector}
                borderRadius="6"
                src={w.iconUrl}
                fullWidth
                fullHeight
              />
            </div>
          ),
          wallet: w,
        };
      });
    walletOpts = walletOpts.filter(({ key }) => key !== 'TomoWallet');
    setWalletOptions(walletOpts);
  }, []);

  const compactModeEnabled = true;
  switch (walletStep) {
    case WalletStep.None:
      walletContent = (
        <ConnectModalIntro getWallet={() => changeWalletStep(WalletStep.Get)} />
      );
      break;
    case WalletStep.LearnCompact:
      walletContent = (
        <ConnectModalIntro
          compactModeEnabled={compactModeEnabled}
          getWallet={() => changeWalletStep(WalletStep.Get)}
        />
      );
      headerLabel = i18n.t('intro.title');
      headerBackButtonLink = WalletStep.None;
      break;
    case WalletStep.Get:
      walletContent = (
        <GetDetail
          getWalletDownload={getWalletDownload}
          compactModeEnabled={compactModeEnabled}
        />
      );
      headerLabel = i18n.t('get.title');
      headerBackButtonLink = compactModeEnabled
        ? WalletStep.LearnCompact
        : WalletStep.None;
      break;
    case WalletStep.Connect:
      walletContent = selectedWallet && (
        <ConnectDetail
          changeWalletStep={changeWalletStep}
          compactModeEnabled={true}
          connectionError={connectionError}
          onClose={onClose}
          qrCodeUri={qrCodeUri}
          reconnect={connectToWallet}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        hasQrCode &&
        (selectedWallet.name === 'WalletConnect'
          ? i18n.t('connect_scan.fallback_title')
          : i18n.t('connect_scan.title', {
              wallet: selectedWallet.name,
            }));
      headerBackButtonLink = compactModeEnabled
        ? connector
          ? null
          : WalletStep.None
        : null;
      headerBackButtonCallback = compactModeEnabled
        ? !connector
          ? clearSelectedWallet
          : () => {}
        : () => {};
      break;
    case WalletStep.DownloadOptions:
      walletContent = selectedWallet && (
        <DownloadOptionsDetail
          changeWalletStep={changeWalletStep}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        selectedWallet &&
        i18n.t('get_options.short_title', { wallet: selectedWallet.name });
      headerBackButtonLink = connector
        ? WalletStep.Connect
        : compactModeEnabled
          ? WalletStep.None
          : initialWalletStep;
      break;
    case WalletStep.Download:
      walletContent = selectedWallet && (
        <DownloadDetail
          changeWalletStep={changeWalletStep}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        selectedWallet &&
        i18n.t('get_mobile.title', { wallet: selectedWallet.name });
      headerBackButtonLink = hasExtensionAndMobile
        ? WalletStep.DownloadOptions
        : initialWalletStep;
      break;
    case WalletStep.InstructionsMobile:
      walletContent = selectedWallet && (
        <InstructionMobileDetail
          connectWallet={selectWallet}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        selectedWallet &&
        i18n.t('get_options.title', {
          wallet: compactModeEnabled
            ? selectedWallet.shortName || selectedWallet.name
            : selectedWallet.name,
        });
      headerBackButtonLink = WalletStep.Download;
      break;
    case WalletStep.InstructionsExtension:
      walletContent = selectedWallet && (
        <InstructionExtensionDetail wallet={selectedWallet} />
      );
      headerLabel =
        selectedWallet &&
        i18n.t('get_options.title', {
          wallet: compactModeEnabled
            ? selectedWallet.shortName || selectedWallet.name
            : selectedWallet.name,
        });
      headerBackButtonLink = WalletStep.DownloadOptions;
      break;
    case WalletStep.InstructionsDesktop:
      walletContent = selectedWallet && (
        <InstructionDesktopDetail
          connectWallet={selectWallet}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        selectedWallet &&
        i18n.t('get_options.title', {
          wallet: compactModeEnabled
            ? selectedWallet.shortName || selectedWallet.name
            : selectedWallet.name,
        });
      headerBackButtonLink = WalletStep.DownloadOptions;
      break;
    default:
      break;
  }

  const theme = useContext(ThemeTypeContext);

  // todo: need to be configurable
  const socialOptions = [
    {
      key: 'google',
      icon: <IconImg width={30} height={30} src={googleIcon} alt="google" />,
    },
    {
      key: 'twitter',
      icon: (
        <IconImg width={30} height={30} src={xIcon} alt="x" theme={theme} />
      ),
    },
    {
      key: 'kakao',
      icon: <IconImg width={30} height={30} src={kakaoIcon} alt="kakao" />,
    },
    {
      key: 'telegram',
      icon: <IconImg width={30} height={30} src={tgIcon} alt="telegram" />,
    },
  ];

  const themeRootProps = useThemeRootProps();

  const getTomoSdk = async () => {
    const provider = (await tomoWallet?.getProvider()) as EthereumProvider;
    return provider.core;
  };

  const loadUserSocialInfo = async () => {
    const tomoSdk = await getTomoSdk();
    const userSocialInfo = await tomoSdk.getUserSocialInfo();
    return userSocialInfo;
  };

  const secureAction = async (userSocialInfo: UserSocialInfo) => {
    const tomoSDK = await getTomoSdk();
    if (!userSocialInfo?.tradePasswordBound) {
      let res: string | boolean;
      if (!userSocialInfo?.recoveryEmail) {
        res = await tomoSDK?.setPayPinAndEmail();
      } else {
        res = await tomoSDK?.setPayPin();
      }
      if (res) {
        await loadUserSocialInfo();
        return res;
      }
    } else if (!userSocialInfo?.recoveryEmail) {
      const res = await tomoSDK?.addRecoveryEmail();
      if (res) {
        await loadUserSocialInfo();
        return res;
      }
    }
  };

  const approveLogin = async () => {
    const tomoSDK = await getTomoSdk();
    const requestAccountsRes = await tomoSDK?.requestAccounts();
    const isApprove = requestAccountsRes === 'approve';
    if (isApprove) {
      // await walletConnect.connect(type)
      tomoWallet?.connect();
    } else {
      await tomoSDK.logout();
    }
  };

  const login = async (loginType: LoginType) => {
    const tomoSdk = await getTomoSdk();
    const ret = await tomoSdk.login(loginType);
    if (ret) {
      try {
        const res = await loadUserSocialInfo();
        console.log('loadUserSocialInfo', res);
        if (!res.recoveryEmail || !res.tradePasswordBound) {
          const isSecure = await secureAction(res);
          if (isSecure) return await approveLogin();
        }
        await approveLogin();
      } catch (e: any) {
        // toast.error(e?.message || 'Failed');
        console.log('login error', e);
      }
      /** assume from here login type is finalized */
      writeSocialLoginType(loginType);
    }
  };

  /** social login */
  const emailContinue = async (email: string) => {
    // loadingFn(async () => {
    const tomoSDK = await getTomoSdk();
    let result: boolean;
    try {
      result = await tomoSDK?.sendCode(email);
    } catch (e) {
      console.log('login error', e);
      return;
    }
    if (result) {
      const verifyEmailCodeResult = await tomoSDK?.verifyLoginEmail(email);
      console.log('verifyEmailCodeResult', verifyEmailCodeResult);
      if (verifyEmailCodeResult) {
        tomoSDK?.handleLoginByEmailSuccess(verifyEmailCodeResult as string);
      }
      if (verifyEmailCodeResult) {
        try {
          const res = await loadUserSocialInfo();
          console.log('loadUserSocialInfo', res);
          if (!res.recoveryEmail || !res.tradePasswordBound) {
            const isSecure = await secureAction(res);
            if (isSecure) return await approveLogin();
          }
          await approveLogin();
        } catch (e: any) {
          console.log('login error', e);
        }
        /** assume from here login type is finalized */
        writeSocialLoginType('email');
      }
    }
  };
  return (
    <Popup opened={opened}>
      {(compactModeEnabled ? walletStep === WalletStep.None : true) && (
        <>
          <PopupHeader onClose={onClose} title="Log in or sign up" close />
          <ConnectMain
            socialOptions={socialOptions}
            walletOptions={walletOptions}
            onClickInputArrow={emailContinue}
            onClickMainButton={async () => {
              login('telegram');
            }}
            onClickSocialItem={async (s: { key: any }) => {
              login(s.key as any);
            }}
            onClickWalletItem={(w: any) => {
              if (isMobile()) {
                connectMobile(w.wallet);
              } else {
                selectWallet(w.wallet);
              }
            }}
          />
        </>
      )}
      <Box {...themeRootProps}>
        <Box
          display="flex"
          flexDirection="row"
          style={{
            maxHeight: walletStep === WalletStep.DownloadOptions ? 414 : 505,
          }}
        >
          {walletStep !== WalletStep.None && (
            <>
              {!compactModeEnabled && (
                <Box background="generalBorder" minWidth="1" width="1" />
              )}
              <Box
                display="flex"
                flexDirection="column"
                margin="20"
                style={{ flexGrow: 1 }}
              >
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="space-between"
                  marginBottom="12"
                >
                  <Box>
                    {headerBackButtonLink && (
                      <HeaderBackIcon
                        onClick={() => {
                          headerBackButtonLink &&
                            changeWalletStep(headerBackButtonLink, true);
                          headerBackButtonCallback?.();
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    style={{ flexGrow: 1 }}
                  >
                    {headerLabel && (
                      <Text
                        color="modalText"
                        size="18"
                        textAlign="center"
                        weight="heavy"
                        style={{
                          width: '100%',
                          fontFamily: 'SwitzerMedium',
                        }}
                      >
                        {headerLabel}
                      </Text>
                    )}
                  </Box>
                  {/* <CloseButton onClose={onClose} /> */}
                  <HeaderCloseIcon onClick={onClose} />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  style={{ minHeight: 396, paddingBottom: 52 }}
                >
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="6"
                    height="full"
                    justifyContent="center"
                    marginX="8"
                  >
                    {walletContent}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Popup>
  );
}

export function TomoConnectModal(props: Props) {
  return props.opened ? <TomoConnectModalInner {...props} /> : null;
}
