import type { LoginType } from '@tomo-inc/social-wallet-sdk/dist/types/types';

const socialLoginTypeStorageKey = 'TOMO_SOCIAL_LOGIN_TYPE';

export function readSocialLoginType() {
  return localStorage.getItem(socialLoginTypeStorageKey);
}

export function writeSocialLoginType(type: LoginType | '' | 'email') {
  localStorage.setItem(socialLoginTypeStorageKey, type);
}
