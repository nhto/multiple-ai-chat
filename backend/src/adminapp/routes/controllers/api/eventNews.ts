import express, { Request, Response, NextFunction } from "express";
import { processAlbums, processPhotos } from "../../../../utilities/payload";
import * as s3 from "../../../../utilities/s3client";
import * as config from "../../../../utilities/config";
import * as EventNewsService from "../../../../services/eventNews";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel } from "../../../../models/model";
import { EventNewsGroups, EventNews } from "../../../../repo/eventNews"; 
import {
  NewsGroupInfo,
} from "../../../../services/eventNews";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

// GET all news group
router.get(
  "/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId } = req.params;

    try {
      let newsGroups = await EventNewsService.getAllNewsGroupByEventIdAdmin(paramEventId);
      return res
        .status(200)
        .send(createApiResponse<any>(null, newsGroups));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET all news in group (admin)
router.get(
  "/admin/:eventId/news-group/:groupId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId, groupId: paramGroupId } = req.params;

    try {
      let news = await EventNewsService.getAllGroupNewsAdmin(
        parseInt(paramGroupId, 10),
        paramEventId
      );
      return res
        .status(200)
        .send(createApiResponse<any[]>(null, news));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//create new news group
router.post('/createNewsGroup', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventNewsGroup = await EventNewsService.createNewsGroup(
      req.session.data.me, 
      req.body?.eventId, 
      req.body.newsGroupName,
      req.body.newsGroupDescription,
      req.body.newsGroupOrder,
      req.body.isPublic,
      req.body.accessRight,);
    return res.status(200).send(createApiResponse('News Group create successfully', eventNewsGroup));
  } catch (err) {
    return next(err);
  }
});

//create new news
router.post('/updateNews', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await EventNewsService.updateNewsGroup(
      req.session.data.me, 
      req.body.newsGroup?.id, 
      req.body.newsGroup?.news_group_name,
      req.body.newsGroup?.news_group_description,
      req.body.newsGroup?.news_group_order,
      req.body.newsGroup?.is_news_group_public,
      req.body.newsGroup?.access_right,
      req.body.newsData,);
    return res.status(200).send(createApiResponse('News group update successfully', ""));
  } catch (err) {
    return next(err);
  }
});

//delete news
router.post('/deleteNews', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await EventNewsService.deleteNews(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse('News delete successfully', ""));
  } catch (err) {
    return next(err);
  }
});


//delete news group
router.post('/deleteNewsGroup', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await EventNewsService.deleteNewsGroup(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse('News group delete successfully', ""));
  } catch (err) {
    return next(err);
  }
});

export default router;
