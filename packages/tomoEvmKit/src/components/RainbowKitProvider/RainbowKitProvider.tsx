import React, {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useAccountEffect } from 'wagmi';
import type { Chain } from 'wagmi/chains';
import { cssStringFromTheme } from '../../css/cssStringFromTheme';
import type { ThemeVars } from '../../css/sprinkles.css';
import type { Locale } from '../../locales';
import { lightTheme } from '../../themes/lightTheme';
import { darkTheme } from '../../themes/darkTheme';
import { TransactionStoreProvider } from '../../transactions/TransactionStoreContext';
import {
  AppContext,
  type DisclaimerComponent,
  defaultAppInfo,
} from './AppContext';
import {
  type AvatarComponent,
  AvatarContext,
  defaultAvatar,
} from './AvatarContext';
import { CoolModeContext } from './CoolModeContext';
import { I18nProvider } from './I18nContext';
import { ModalProvider } from './ModalContext';
import {
  ModalSizeOptions,
  ModalSizeProvider,
  type ModalSizes,
} from './ModalSizeContext';
import { RainbowKitChainProvider } from './RainbowKitChainContext';
import { ShowBalanceProvider } from './ShowBalanceContext';
import { ShowRecentTransactionsContext } from './ShowRecentTransactionsContext';
import { WalletButtonProvider } from './WalletButtonContext';
import { useFingerprint } from './useFingerprint';
import { usePreloadImages } from './usePreloadImages';
import { clearWalletConnectDeepLink } from './walletConnectDeepLink';
//@ts-expect-error: no type file
import styleInject from 'style-inject';

const injectCss = `@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");@import url("https://at.alicdn.com/t/c/font_4714049_v2ep5icmokp.css");`;

const ThemeIdContext = createContext<string | undefined>(undefined);

const attr = 'data-rk';

const createThemeRootProps = (id: string | undefined) => ({ [attr]: id || '' });

const createThemeRootSelector = (id: string | undefined) => {
  if (id && !/^[a-zA-Z0-9_]+$/.test(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }

  return id ? `[${attr}="${id}"]` : `[${attr}]`;
};

export const useThemeRootProps = () => {
  const id = useContext(ThemeIdContext);
  return createThemeRootProps(id);
};

export type Theme =
  | ThemeVars
  | {
      lightMode: ThemeVars;
      darkMode: ThemeVars;
    };

export interface RainbowKitProviderProps {
  initialChain?: Chain | number;
  id?: string;
  children: ReactNode;
  // theme?: Theme | null; // change to only support 'light' | 'dark'
  theme?: 'light' | 'dark';
  showRecentTransactions?: boolean;
  appInfo?: {
    appName?: string;
    learnMoreUrl?: string;
    disclaimer?: DisclaimerComponent;
  };
  coolMode?: boolean;
  avatar?: AvatarComponent;
  modalSize?: ModalSizes;
  locale?: Locale;
}

// const defaultTheme = lightTheme();

export const ThemeTypeContext = React.createContext<'light' | 'dark'>('light');

export function RainbowKitProvider({
  appInfo,
  avatar,
  children,
  coolMode = false,
  id,
  initialChain,
  // locale,
  modalSize = ModalSizeOptions.WIDE,
  showRecentTransactions = false,
  theme: themeType = 'light',
}: RainbowKitProviderProps) {
  usePreloadImages();
  useFingerprint();

  useAccountEffect({ onDisconnect: clearWalletConnectDeepLink });

  // if (typeof theme === 'function') {
  //   throw new Error(
  //     'A theme function was provided to the "theme" prop instead of a theme object. You must execute this function to get the resulting theme object.',
  //   );
  // }

  const selector = createThemeRootSelector(id);

  const appContext = {
    ...defaultAppInfo,
    ...appInfo,
  };

  const avatarContext = avatar ?? defaultAvatar;

  useEffect(() => {
    styleInject(injectCss, { insertAt: 'top' });
  }, []);

  const theme = useMemo(
    () => (themeType === 'dark' ? darkTheme() : lightTheme()),
    [themeType],
  ) as Theme;

  useEffect(() => {
    if (themeType === 'dark') {
      document.documentElement.classList.add('uikit-dark');
    } else {
      document.documentElement.classList.remove('uikit-dark');
    }
  }, [themeType]);

  return (
    <ThemeTypeContext.Provider value={themeType}>
      <RainbowKitChainProvider initialChain={initialChain}>
        <WalletButtonProvider>
          <I18nProvider locale={'en-US'}>
            {/* <I18nProvider locale={locale}> */}
            <CoolModeContext.Provider value={coolMode}>
              <ModalSizeProvider modalSize={modalSize}>
                <ShowRecentTransactionsContext.Provider
                  value={showRecentTransactions}
                >
                  <TransactionStoreProvider>
                    <AvatarContext.Provider value={avatarContext}>
                      <AppContext.Provider value={appContext}>
                        <ThemeIdContext.Provider value={id}>
                          <ShowBalanceProvider>
                            <ModalProvider>
                              <>
                                <span
                                  style={{ position: 'absolute' }}
                                  id="font-load-dummy"
                                >
                                  <span
                                    style={{
                                      fontFamily: 'SwitzerBold',
                                      visibility: 'hidden',
                                    }}
                                  >
                                    just to load font
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: 'SwitzerMedium',
                                      visibility: 'hidden',
                                    }}
                                  >
                                    just to load font
                                  </span>
                                </span>
                                {theme ? (
                                  <div {...createThemeRootProps(id)}>
                                    <style
                                      // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO
                                      dangerouslySetInnerHTML={{
                                        // Selectors are sanitized to only contain alphanumeric
                                        // and underscore characters. Theme values generated by
                                        // cssStringFromTheme are sanitized, removing
                                        // characters that terminate values / HTML tags.
                                        __html: [
                                          `${selector}{${cssStringFromTheme(
                                            'lightMode' in theme
                                              ? theme.lightMode
                                              : theme,
                                          )}}`,

                                          'darkMode' in theme
                                            ? `@media(prefers-color-scheme:dark){${selector}{${cssStringFromTheme(
                                                theme.darkMode,
                                                { extends: theme.lightMode },
                                              )}}}`
                                            : null,
                                        ].join(''),
                                      }}
                                    />
                                    {children}
                                  </div>
                                ) : (
                                  children
                                )}
                              </>
                            </ModalProvider>
                          </ShowBalanceProvider>
                        </ThemeIdContext.Provider>
                      </AppContext.Provider>
                    </AvatarContext.Provider>
                  </TransactionStoreProvider>
                </ShowRecentTransactionsContext.Provider>
              </ModalSizeProvider>
            </CoolModeContext.Provider>
          </I18nProvider>
        </WalletButtonProvider>
      </RainbowKitChainProvider>
    </ThemeTypeContext.Provider>
  );
}
