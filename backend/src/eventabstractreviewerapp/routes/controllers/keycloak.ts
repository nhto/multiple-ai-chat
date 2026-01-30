import express, { Request, Response } from 'express';
import logger from '../../../utilities/logger';
import * as AuthnService from '../../../services/authn';
import { getCodeVerifier, getAuthorizationUrl, getLogoutUrl, getTokenSetAsync, getCodeChallenge } from '../../../utilities/keycloak';
import * as iamapi from '../../../utilities/iamapi';
import { ApiError } from '../../../models/error';
import { RoleLabel, KeycloakLoginType } from '../../../models/model';
import * as config from '../../../utilities/config';

const router = express.Router();

router.get('/keycloak-init/:loginType', async (req: Request, res: Response) => {
  try {
    const loginType = String(req.params?.loginType);
    console.log("loginType");
    console.log(loginType);
    if (!loginType || !Object.keys(KeycloakLoginType).includes(loginType)) throw new ApiError("Invalid login type.")

    const originUrl: string = !!req.query?.originUrl ? String(req.query.originUrl) : "/";
    const codeVerifier = getCodeVerifier();
    const codeChallenge = getCodeChallenge(codeVerifier);

    req.session.data = {
      codeVerifier,
      originUrl,
      logoutUrl: getLogoutUrl(loginType),
      lastActivityAt: null,
      idToken: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      me: null,
    };
    req.session.netId = "";
    req.session.sub = "";

    const loginUrl = await getAuthorizationUrl(loginType, codeChallenge);
    return res.status(200).redirect(loginUrl);

  } catch (err) {
    console.log(err);
    logger.warn("Error thrown on /keycloak-init");
    return res.status(200).redirect("/");
  }
});

router.get('/keycloak-callback/:loginType', async (req: Request, res: Response) => {
  const loginType = String(req.params?.loginType);
  if (!loginType || !Object.keys(KeycloakLoginType).includes(loginType)) throw new ApiError("Invalid login type.")

  const originUrl = req.session.data?.originUrl || '/';
  const codeVerifier = req.session?.data?.codeVerifier;

  req.session.data = {
    codeVerifier: null,
    originUrl: null,
    logoutUrl: getLogoutUrl(loginType),
    lastActivityAt: null,
    idToken: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    me: null,
  };
  req.session.netId = "";
  req.session.sub = "";

  try {
    const authenticationResult = await getTokenSetAsync(req, loginType, codeVerifier);

    req.session.data.lastActivityAt = (new Date()).toISOString();
    req.session.data.idToken = authenticationResult.claims();
    req.session.data.accessToken = authenticationResult.access_token;
    req.session.data.refreshToken = authenticationResult.refresh_token;
    req.session.data.isAuthenticated = true;
  }
  catch (error) {
    logger.warn("Error thrown on /keycloak-callback");
    logger.warn(error);
    return res.status(200).redirect("/");
  }

  try {
    const upn = String(req.session.data.idToken.upn);
    const sub = "KC_" + String(req.session.data.idToken.sub);
    const surname = String(req.session.data.idToken.family_name);
    const givenName = String(req.session.data.idToken.given_name);
    const email = String(req.session.data.idToken.email);

    let netId: string;
    let userType: string;
    switch (loginType) {
      case KeycloakLoginType.alumni:
        netId = !!upn ? String(upn).replace(/\@.*/i, "") : null;
        userType = RoleLabel.Alumni;
        break;

      case KeycloakLoginType.public:
        netId = email;
        userType = RoleLabel.Guests;
        break;

      default:
        throw new Error("Invalid login type.");
    }

    req.session.data.me = {
      netId,
      name: {
        surname,
        givenName
      },
      email,
      userType,
      userId: netId,
      roles: [{
        roleLabel: RoleLabel.User,
        eventId: null
      }],
    }
    req.session.netId = req.session.data.me?.netId;
    req.session.sub = sub;

    if (String(originUrl).startsWith("/")) {
      return res.status(200).redirect(String(originUrl));
    }
    else if (String(originUrl).startsWith("http")) {
      const url = new URL(String(originUrl));
      if (!!url.search) {
        return res.status(200).redirect(url.pathname + url.search);
      }
      else {
        return res.status(200).redirect(url.pathname);
      }
    }
    else {
      return res.status(200).redirect("/");
    }
  }
  catch (error) {
    logger.warn("Error thrown on /keycloak-callback");
    logger.warn(error);
    return res.status(200).redirect("/");
  }
});

//for handling event files keycloak login
router.get('/keycloak-callback', async (req: Request, res: Response) => {
  const loginType = req.session.data?.logoutUrl === config.MSAL_KEYCLOAK_ALUMNI_LOGOUT_URI? "alumni" : "public";
  if (!loginType || !Object.keys(KeycloakLoginType).includes(loginType)) throw new ApiError("Invalid login type.")

  const originUrl = req.session.data?.originUrl || '/';
  const codeVerifier = req.session?.data?.codeVerifier;

  req.session.data = {
    codeVerifier: null,
    originUrl: null,
    logoutUrl: getLogoutUrl(loginType),
    lastActivityAt: null,
    idToken: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    me: null,
  };
  req.session.netId = "";
  req.session.sub = "";

  try {
    const authenticationResult = await getTokenSetAsync(req, loginType, codeVerifier);

    req.session.data.lastActivityAt = (new Date()).toISOString();
    req.session.data.idToken = authenticationResult.claims();
    req.session.data.accessToken = authenticationResult.access_token;
    req.session.data.refreshToken = authenticationResult.refresh_token;
    req.session.data.isAuthenticated = true;
  }
  catch (error) {
    logger.warn("Error thrown on /keycloak-callback");
    logger.warn(error);
    return res.status(200).redirect("/");
  }

  try {
    const upn = String(req.session.data.idToken.upn);
    const sub = "KC_" + String(req.session.data.idToken.sub);
    const surname = String(req.session.data.idToken.family_name);
    const givenName = String(req.session.data.idToken.given_name);
    const email = String(req.session.data.idToken.email);

    let netId: string;
    let userType: string;
    switch (loginType) {
      case KeycloakLoginType.alumni:
        netId = !!upn ? String(upn).replace(/\@.*/i, "") : null;
        userType = RoleLabel.Alumni;
        break;

      case KeycloakLoginType.public:
        netId = email;
        userType = RoleLabel.Guests;
        break;

      default:
        throw new Error("Invalid login type.");
    }

    req.session.data.me = {
      netId,
      name: {
        surname,
        givenName
      },
      email,
      userType,
      userId: netId,
      roles: [{
        roleLabel: RoleLabel.User,
        eventId: null
      }],
    }
    req.session.netId = req.session.data.me?.netId;
    req.session.sub = sub;

    if (String(originUrl).startsWith("/")) {
      return res.status(200).redirect(String(originUrl));
    }
    else if (String(originUrl).startsWith("http")) {
      const url = new URL(String(originUrl));
      if (!!url.search) {
        return res.status(200).redirect(url.pathname + url.search);
      }
      else {
        return res.status(200).redirect(url.pathname);
      }
    }
    else {
      return res.status(200).redirect("/");
    }
  }
  catch (error) {
    logger.warn("Error thrown on /keycloak-callback");
    logger.warn(error);
    return res.status(200).redirect("/");
  }
});

export default router;