import { useState, useEffect, useCallback } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { saveTokens, clearTokens, getAccessToken } from '../services/auth';

const OAUTH_LOGIN = gql`
  mutation OAuthLogin($input: OAuthInput!) {
    oauthLogin(input: $input) {
      accessToken
      refreshToken
      isNewUser
    }
  }
`;

const SEND_CODE = gql`
  mutation SendLoginCode($input: EmailLoginInput!) {
    sendLoginCode(input: $input)
  }
`;

const VERIFY_CODE = gql`
  mutation VerifyLoginCode($input: VerifyCodeInput!) {
    verifyLoginCode(input: $input) {
      accessToken
      refreshToken
      isNewUser
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      avatar
      coins
      jokersCount
      currentLevel
      currentTier
      streakDays
      totalWins
    }
  }
`;

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [oauthLoginMutation] = useMutation(OAUTH_LOGIN);
  const [sendCodeMutation] = useMutation(SEND_CODE);
  const [verifyCodeMutation] = useMutation(VERIFY_CODE);
  const [fetchMe] = useLazyQuery(ME_QUERY);

  const loadUser = useCallback(async () => {
    const token = await getAccessToken();
    if (token) {
      const { data } = await fetchMe();
      if (data?.me) {
        setUser(data.me);
      }
    }
    setLoading(false);
  }, [fetchMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loginWithOAuth = async (provider: string, token: string) => {
    const { data } = await oauthLoginMutation({
      variables: { input: { provider, token } },
    });
    await saveTokens(data.oauthLogin.accessToken, data.oauthLogin.refreshToken);
    await loadUser();
  };

  const sendLoginCode = async (email: string) => {
    await sendCodeMutation({ variables: { input: { email } } });
  };

  const verifyLoginCode = async (email: string, code: string) => {
    const { data } = await verifyCodeMutation({
      variables: { input: { email, code } },
    });
    await saveTokens(
      data.verifyLoginCode.accessToken,
      data.verifyLoginCode.refreshToken,
    );
    await loadUser();
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
  };

  return {
    user,
    loading,
    loginWithOAuth,
    sendLoginCode,
    verifyLoginCode,
    logout,
  };
}
