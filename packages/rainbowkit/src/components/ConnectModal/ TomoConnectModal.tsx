// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Popup,
  PopupHeader,
  ConnectMain,
  type WalletItemProps,
} from 'tm-uikit';
import { WalletButtonContext } from '../RainbowKitProvider/WalletButtonContext';
import {
  useWalletConnectors,
  type WalletConnector,
} from '../../wallets/useWalletConnectors';
import { groupBy } from '../../utils/groupBy';
import { addLatestWalletId } from '../../wallets/latestWalletId';
import { WalletStep } from '../ConnectOptions/DesktopOptions';
import { isSafari } from '../../utils/browsers';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { maxWidth } from '../WalletButton/WalletButton.css';
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
import { touchableStyles } from '../../css/touchableStyles';
import { Text } from '../Text/Text';
import { CloseButton } from '../CloseButton/CloseButton';
import { BackIcon } from '../Icons/Back';
import googleIcon from '../../../assets/icon_google.svg';
import xIcon from '../../../assets/icon_x.svg';
import kakaoIcon from '../../../assets/icon_kakao.svg';
import tgIcon from '../../../assets/icon_telegram.svg';
import type { EthereumProvider } from 'tm-web-sdk';
import { useThemeRootProps } from '../RainbowKitProvider/RainbowKitProvider';

interface Props {
  opened: boolean;
  onClose: () => any;
}

function IconImg({
  className,
  src,
  alt,
  ...props
}: React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) {
  // biome-ignore lint/a11y/useAltText: no need
  return <img alt={alt || ''} src={src} {...props} className={className} />;
}

export function TomoConnectModal({ opened, onClose }: Props) {
  // const titleId = 'rk_connect_title';
  // const [selectedOptionId, setSelectedOptionId] = useState<
  // string | undefined
  // >();
  const [selectedWallet, setSelectedWallet] = useState<WalletConnector>();
  const [qrCodeUri, setQrCodeUri] = useState<string>();
  const hasQrCode = !!selectedWallet?.qrCode && qrCodeUri;
  const [connectionError, setConnectionError] = useState(false);
  // const modalSize = useContext(ModalSizeContext);
  // const compactModeEnabled = modalSize === ModalSizeOptions.COMPACT;
  // const { disclaimer: Disclaimer } = useContext(AppContext);
  // const { i18n } = useContext(I18nContext);
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

  const tomoWallet = wallets.find((w) => w.id === 'TomoWallet');

  // biome-ignore lint/correctness/useExhaustiveDependencies: on mount logic
  useEffect(() => {
    let walletOpts: (WalletItemProps & { wallet: WalletConnector })[] =
      wallets.map((w) => {
        return {
          key: w.id,
          name: w.name,
          desc: w.name,
          icon: (
            <AsyncImage
              background={'transparent'}
              // We want to use pure <img /> element
              // to avoid bugs with eip6963 icons as sometimes
              // background: url(...) does not work
              useAsImage={!w.isRainbowKitConnector}
              borderRadius="6"
              height="54"
              src={w.iconUrl}
              width="54"
              fullWidth
            />
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

  // todo: need to be configurable
  const socialOptions = [
    {
      key: 'google',
      icon: <IconImg src={googleIcon} alt="google" />,
    },
    {
      key: 'x',
      icon: <IconImg src={xIcon} alt="x" />,
    },
    {
      key: 'kakao',
      icon: <IconImg src={kakaoIcon} alt="kakao" />,
    },
    {
      key: 'telegram',
      icon: <IconImg src={tgIcon} alt="telegram" />,
    },
  ];

  const themeRootProps = useThemeRootProps();

  return (
    <Popup opened={opened}>
      {(compactModeEnabled ? walletStep === WalletStep.None : true) && (
        <>
          <PopupHeader onClose={onClose} title="Log in or sign up" close />
          <ConnectMain
            socialOptions={socialOptions}
            walletOptions={walletOptions}
            onClickInputArrow={() => 'emailContinue'}
            onClickMainButton={() => 'telegramLogin'}
            onClickSocialItem={async (s: { key: any }) => {
              const provider =
                (await tomoWallet?.getProvider()) as EthereumProvider;
              try {
                const loginSuccess = await provider.core.login(s.key as any);
                if (loginSuccess) {
                  // const res = await provider.core.getUserSocialInfo();
                  tomoWallet?.connect();
                }
              } catch (e) {
                console.error(e);
              }
            }}
            onClickWalletItem={(w: any) => selectWallet(w.wallet)}
          />
        </>
      )}
      <Box {...themeRootProps}>
        <Box
          display="flex"
          flexDirection="row"
          style={{ maxHeight: compactModeEnabled ? 468 : 504 }}
        >
          {(compactModeEnabled ? walletStep !== WalletStep.None : true) && (
            <>
              {!compactModeEnabled && (
                <Box background="generalBorder" minWidth="1" width="1" />
              )}
              <Box
                display="flex"
                flexDirection="column"
                margin="16"
                style={{ flexGrow: 1 }}
              >
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="space-between"
                  marginBottom="12"
                >
                  <Box width="28">
                    {headerBackButtonLink && (
                      <Box
                        as="button"
                        className={touchableStyles({
                          active: 'shrinkSm',
                          hover: 'growLg',
                        })}
                        color="accentColor"
                        onClick={() => {
                          headerBackButtonLink &&
                            changeWalletStep(headerBackButtonLink, true);
                          headerBackButtonCallback?.();
                        }}
                        paddingX="8"
                        paddingY="4"
                        style={{
                          boxSizing: 'content-box',
                          height: 17,
                          willChange: 'transform',
                        }}
                        transition="default"
                        type="button"
                      >
                        <BackIcon />
                      </Box>
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
                      >
                        {headerLabel}
                      </Text>
                    )}
                  </Box>
                  <CloseButton onClose={onClose} />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  style={{ minHeight: compactModeEnabled ? 396 : 432 }}
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
