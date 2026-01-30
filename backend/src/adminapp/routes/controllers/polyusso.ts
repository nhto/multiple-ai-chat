import express, { Request, Response } from 'express';
import logger from '../../../utilities/logger';
import * as AuthnService from '../../../services/authn';
import { getCodeVerifier, getAuthorizationUrl, getTokenSetAsync, getCodeChallenge } from '../../../utilities/polyusso';
import * as config from '../../../utilities/config';
import * as iamapi from '../../../utilities/iamapi';
import { ApiError } from '../../../models/error';

const router = express.Router();

router.get('/polyusso-init', async (req: Request, res: Response) => {
  try {
    const originUrl: string = !!req.query?.originUrl ? String(req.query.originUrl) : "/";
    const reauth: boolean = !!req.query?.reauth;
    const codeVerifier = getCodeVerifier();
    const codeChallenge = getCodeChallenge(codeVerifier);

    req.session.data = {
      codeVerifier,
      originUrl,
      logoutUrl: null,
      lastActivityAt: null,
      idToken: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      me: null,
    };
    req.session.netId = "";

    const loginUrl = await getAuthorizationUrl(codeChallenge) + (reauth ? "&prompt=login" : "");
    return res.status(200).redirect(loginUrl);

  } catch (err) {
    logger.warn("Error thrown on /polyusso-init");
    return res.status(200).redirect("/");
  }
});

router.get('/polyusso-callback', async (req: Request, res: Response) => {

  const originUrl = req.session.data?.originUrl || '/';
  const codeVerifier = req.session?.data?.codeVerifier;

  req.session.data = {
    codeVerifier: null,
    originUrl: null,
    logoutUrl: null,
    lastActivityAt: null,
    idToken: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    me: null,
  };
  req.session.netId = "";

  try {
    const authenticationResult = await getTokenSetAsync(req, codeVerifier);

    req.session.data.lastActivityAt = (new Date()).toISOString();
    req.session.data.idToken = authenticationResult.claims();
    req.session.data.accessToken = authenticationResult.access_token;
    req.session.data.refreshToken = authenticationResult.refresh_token;
    req.session.data.isAuthenticated = true;
  }
  catch (error) {
    logger.warn("Error thrown on /polyusso-callback");
    logger.warn(error);
    return res.status(200).redirect("/polyusso-init?reauth=true");
  }

  try {
    const netId = String(req.session.data.idToken.cn);

    const iamapiNetId = await iamapi.getUserDetailsByNetId(netId);

    // Check eligibility
    if (!AuthnService.isLoginAuthorized(iamapiNetId)) {
      throw new ApiError('Unauthorized.');
    }

    // Provision or update user during login
    await AuthnService.syncUser(iamapiNetId);

    req.session.data.me = await AuthnService.getMeSummary(netId);
    req.session.netId = req.session.data.me?.netId;

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
    logger.warn("Error thrown on /polyusso-callback");
    logger.warn(error);
    return res.status(200).redirect("/polyusso-init?reauth=reauth");
  }
});

router.get('/polyusso-logout', async (req: Request, res: Response) => {
  try {
    req.session.destroy(() => null);
  }
  catch (error) {
    logger.warn("Error thrown on /polyusso-logout");
    logger.warn(error);
  }

  return res.status(200).redirect(config.MSAL_POLYUSSO_LOGOUT_URI);
});


export default router;