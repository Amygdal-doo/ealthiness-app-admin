import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface TokenStorage {
  accessToken: string;
  refreshToken: string;
}

export const clientTokens = {
  set: (tokens: TokenStorage) => {
    Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  },

  get: (): TokenStorage | null => {
    const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    
    if (!accessToken || !refreshToken) {
      return null;
    }
    
    return { accessToken, refreshToken };
  },

  getAccessToken: (): string | null => {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  },

  clear: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }
};