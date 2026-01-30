import logger from '../utilities/logger';
import * as config from '../utilities/config';
import { custom, Issuer, generators, BaseClient, TokenSet } from 'openid-client';
import { IncomingMessage, RequestOptions } from 'http';
import { RoleLabel, KeycloakLoginType } from '../models/model';


interface KeycloakLogin {
  type: string,
  issuer: Issuer,
  client: BaseClient
};
const keycloakLogins: KeycloakLogin[] = [];

export const initAsync = async (loginType: string): Promise<void> => (async () => {
  let authorityType: string;
  let clientSecret: string;
  let clientId: string;
  let redirectUri: string;
  switch (loginType) {
    case KeycloakLoginType.alumni:
      authorityType = config.MSAL_KEYCLOAK_ALUMNI_AUTHORITY;
      clientSecret = config.MSAL_KEYCLOAK_ALUMNI_SECRETS;
      clientId = config.MSAL_KEYCLOAK_ALUMNI_CLIENT_ID;
      redirectUri = config.MSAL_KEYCLOAK_ALUMNI_REDIRECT_URI;
      break;

    case KeycloakLoginType.public:
      authorityType = config.MSAL_KEYCLOAK_PUBLIC_AUTHORITY;
      clientSecret = config.MSAL_KEYCLOAK_PUBLIC_SECRETS;
      clientId = config.MSAL_KEYCLOAK_PUBLIC_CLIENT_ID;
      redirectUri = config.MSAL_KEYCLOAK_PUBLIC_REDIRECT_URI;
      break;

    default:
      throw new Error("Invalid login type.");
  }

  const keycloakLogin: KeycloakLogin = { type: loginType, issuer: null, client: null };
  keycloakLogin.issuer = await Issuer.discover(authorityType);
  logger.info('Discovered issuer %s %O', keycloakLogin.issuer.issuer, keycloakLogin.issuer.metadata);

  keycloakLogin.client = new keycloakLogin.issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
  }); // => Client

  keycloakLogins.push(keycloakLogin);
})();

export const getCodeVerifier = (): string => {
  return generators.codeVerifier();
}

export const getCodeChallenge = (codeVerifier: string): string => {
  return generators.codeChallenge(codeVerifier);
}

export const getAuthorizationUrl = (loginType: string, codeChallenge: string): string => {
  const keycloakLogin = keycloakLogins.find(login => login.type === loginType);
  if (!keycloakLogin) throw new Error("Invalid login type.");

  return keycloakLogin.client.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
}

export const getTokenSetAsync = async (req: IncomingMessage, loginType: string, codeVerifier?: string): Promise<TokenSet> => {
  const keycloakLogin = keycloakLogins.find(login => login.type === loginType);
  if (!keycloakLogin) throw new Error("Invalid login type.");
  let redirectUrL: string;
  switch (loginType) {
    case KeycloakLoginType.alumni:
      redirectUrL = config.MSAL_KEYCLOAK_ALUMNI_REDIRECT_URI;
      break;

    case KeycloakLoginType.public:
      redirectUrL = config.MSAL_KEYCLOAK_PUBLIC_REDIRECT_URI;
      break;

    default:
      throw new Error("Invalid login type.");
  }
  const redirectUri = redirectUrL;

  const params = keycloakLogin.client.callbackParams(req);
  let tokenSet = null;
  if (!!codeVerifier) {
    tokenSet = await keycloakLogin.client.callback(redirectUri, params, { code_verifier: codeVerifier });
  }
  else {
    tokenSet = await keycloakLogin.client.callback(redirectUri, params);
  }
  logger.info('Authenticated user with claims %0', tokenSet.claims());

  return tokenSet;
}

export const getTokenSetByRefreshTokenAsync = async (userType: string, refreshToken: string): Promise<TokenSet> => {
  let loginType: string;
  switch (userType) {
    case RoleLabel.Alumni:
      loginType = KeycloakLoginType.alumni;
      break;

    case RoleLabel.Guests:
      loginType = KeycloakLoginType.public;
      break;

    default:
      throw new Error("Invalid user type.");
  }
  const keycloakLogin = keycloakLogins.find(login => login.type === loginType);
  if (!keycloakLogin) throw new Error("Invalid login type.");

  const tokenSet = await keycloakLogin.client.refresh(refreshToken);
  logger.info('Got user idtoken with claims %0', tokenSet.claims());

  return tokenSet;
}

export const getLogoutUrl = (loginType: string) => {
  let logoutUri: string;
  switch (loginType) {
    case KeycloakLoginType.alumni:
      logoutUri = config.MSAL_KEYCLOAK_ALUMNI_LOGOUT_URI;
      break;

    case KeycloakLoginType.public:
      logoutUri = config.MSAL_KEYCLOAK_PUBLIC_LOGOUT_URI;
      break;

    default:
      return "/";
  }

  return logoutUri;
}