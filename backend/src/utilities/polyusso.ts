import logger from '../utilities/logger';
import * as config from '../utilities/config';
import { custom, Issuer, generators, BaseClient, TokenSet } from 'openid-client';
import { IncomingMessage, RequestOptions } from 'http';


let issuer: Issuer = null;
let client: BaseClient = null;

export const initAsync = async (): Promise<void> => (async () => {
  issuer = await Issuer.discover(config.MSAL_POLYUSSO_AUTHORITY);
  logger.info('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

  client = new issuer.Client({
    client_id: config.MSAL_POLYUSSO_CLIENT_ID,
    client_secret: config.MSAL_POLYUSSO_SECRETS,
    redirect_uris: [config.MSAL_POLYUSSO_REDIRECT_URI],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
  }); // => Client
})();

export const getCodeVerifier = (): string => {
  return generators.codeVerifier();
}

export const getCodeChallenge = (codeVerifier: string): string => {
  return generators.codeChallenge(codeVerifier);
}

export const getAuthorizationUrl = (codeChallenge: string): string => {
  return client.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
}

export const getTokenSetAsync = async (req: IncomingMessage, codeVerifier?: string): Promise<TokenSet> => {
  const params = client.callbackParams(req);
  let tokenSet = null;
  if (!!codeVerifier) {
    tokenSet = await client.callback(config.MSAL_POLYUSSO_REDIRECT_URI, params, { code_verifier: codeVerifier });
  }
  else {
    tokenSet = await client.callback(config.MSAL_POLYUSSO_REDIRECT_URI, params);
  }
  logger.info('Authenticated user with claims %0', tokenSet.claims());

  return tokenSet;
}

export const getTokenSetByRefreshTokenAsync = async (refreshToken: string): Promise<TokenSet> => {
  const tokenSet = await client.refresh(refreshToken);
  logger.info('Got user idtoken with claims %0', tokenSet.claims());

  return tokenSet;
}

export const getLogoutUrl = (): string => {
  return config.MSAL_POLYUSSO_LOGOUT_URI;
}