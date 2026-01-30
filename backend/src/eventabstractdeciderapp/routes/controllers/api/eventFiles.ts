import express, { Request, Response, NextFunction } from "express";
import * as s3 from "../../../../utilities/s3client";
import { createApiResponse } from "../../../../models/model";
import * as FilesService from "../../../../services/eventFiles";
import {
  FolderInfo,
  FolderFileAttributes,
} from "../../../../services/eventFiles";
import { EventFolders, EventFiles } from "../../../../repo/eventFiles"; 
import { accessDeniedHtml } from "../../../utils/accessDenied";
import { getEventDetailsById } from "../../../../services/event";
import {
  enhanceFileObjects,
  EnhancedFolderFileAttributes,
} from "../../../../utilities/payload";
import * as config from "../../../../utilities/config";
import { ApiError } from "../../../../models/error";

const router = express.Router();

// GET all folders
router.get(
  "/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId } = req.params;

    try {
      if(!req.session?.data?.isAuthenticated){
        throw new ApiError('Unauthorized access');
      }

      let folders = await FilesService.getAllFoldersByEventId(paramEventId, req.session.data.me);
      return res
        .status(200)
        .send(createApiResponse<FolderInfo[]>(null, folders));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET all folder files
router.get(
  "/:eventId/folder/:folderId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId, folderId: paramFolderId } = req.params;

    try {
      let files = await FilesService.getAllFolderFiles(
        parseInt(paramFolderId, 10),
        paramEventId,
        req.session.data?.me?? null
      );
      let enhancedFiles = enhanceFileObjects(
        files,
        paramEventId,
        paramFolderId
      );
      return res
        .status(200)
        .send(
          createApiResponse<EnhancedFolderFileAttributes[]>(null, enhancedFiles)
        );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET Event Name
router.get(
  "/eventName/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId } = req.params;

    try {
      let eventName = await FilesService.getEventName(paramEventId);
      return res
        .status(200)
        .send(createApiResponse<any>(null, eventName));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);


// DOWNLOAD SINGLE file
router.get(
  "/:eventId/download/:fileName",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, fileName } = req.params;
    const file = await EventFiles.findOne({ 
      where: { s3FileName: fileName }
    });
    const s3Key = `${config.S3CLIENT_DOCUMENT_FOLDER}/${eventId}/${file.folderId}/${fileName}`; // TODO update the s3KeyPrefix
    const userDefinedFileName = await FilesService.getFileNameByS3FileName(
      fileName
    );
    const eventDetail = await getEventDetailsById(eventId);

    if (!eventDetail) {
      return res.status(404).send("Event not found");
    }

    try {
      const permission = await FilesService.getFileAccessByS3FileName(fileName, req.session.data?.me?? null);
      if (permission.isFileAccessible === 0) {
        let customizedHtml = accessDeniedHtml
          .replace("{{topic}}", eventDetail.topic)
          .replace("{{contactName}}", eventDetail.contactName)
          .replace("{{contactEmail}}", eventDetail.contactEmail)
          .replace("{{contactPhoneNumber}}", eventDetail.contactPhoneNumber)
          .replace("{{contactDept}}", eventDetail.contactDept);
        return res.status(403).send(customizedHtml);
      }
      await s3.getSingleFile(s3Key, res, userDefinedFileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// DOWNLOAD ALL folder files
router.get(
  "/download/zip/:folderId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { folderId } = req.params;
    const folder = await EventFolders.findOne({ 
      where: { id: folderId }
    });
    const filteredS3FileNames = await FilesService.getAccessibleS3FileNames(
      parseInt(folderId, 10)
    );
    const userDefinedFolderName = await FilesService.getFolderNameByFolderId(
      parseInt(folderId, 10)
    );

    try {
      await s3.getAllBucketFilesZipped(
        folderId,
        res,
        userDefinedFolderName,
        filteredS3FileNames,
        folder.eventId
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.get(
  "/visibility/:folderId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { folderId: paramFolderId } = req.params;

    try {
      let folderVisibility = await FilesService.getFolderVisibility(paramFolderId) === true? "Public": "Private";
      return res
        .status(200)
        .send(createApiResponse<any>(null, folderVisibility));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
