import express, { NextFunction, Request, Response } from 'express';
import { ApiError, apiInternalServerError, apiSessionTimeoutError } from '../../../../models/error';
import { requireRole } from '../../middlewares/authn';
import { createApiResponse, RoleLabel } from '../../../../models/model';

import * as WebPageService from '../../../../services/webPage';
import { WebPageAttributes } from '../../../../repo/webPage';

const router = express.Router();

router.post('/get', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webPages = await WebPageService.get(req.body.webId);
    return res.status(200).send(createApiResponse<WebPageAttributes[]>(null, webPages));
  } catch (err) {
    return next(err);
  }
});

// router.post('/save/all', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const webPages = await WebPageService.saveAll(req.session.data.me, req.body.webId, req.body.pagesVariables);
//     return res.status(200).send(createApiResponse<WebPageAttributes[]>(null, webPages));
//   } catch (err) {
//     return next(err);
//   }
// });

router.post('/save/page', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = await WebPageService.save(req.session.data.me, req.body.webId, req.body.pageVariables);
    return res.status(200).send(createApiResponse<string>(null, id));
  } catch (err) {
    return next(err);
  }
});

router.post('/page-ids/update', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webPages = await WebPageService.updatePageIds(req.session.data.me, req.body.webId, req.body.pageIds);
    return res.status(200).send(createApiResponse<WebPageAttributes[]>(null, webPages));
  } catch (err) {
    return next(err);
  }
});

export default router;