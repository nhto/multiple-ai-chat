import express, { Request, Response, NextFunction } from "express";
import { processAlbums, processPhotos } from "../../../../utilities/payload";
import * as s3 from "../../../../utilities/s3client";
import * as config from "../../../../utilities/config";
import * as FilesService from "../../../../services/eventFiles";
import { requireRole } from "../../middlewares/authn";
import { createApiResponse, RoleLabel } from "../../../../models/model";
import { EventFolders, EventFiles } from "../../../../repo/eventFiles"; 
import {
  FolderInfo,
  FolderFileAttributes,
} from "../../../../services/eventFiles";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

// GET all folders
router.get(
  "/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId } = req.params;

    try {
      let folders = await FilesService.getAllFoldersByEventId(paramEventId, null);
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
        null
      );
      return res
        .status(200)
        .send(createApiResponse<FolderFileAttributes[]>(null, files));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET all folder files (admin)
router.get(
  "/admin/:eventId/folder/:folderId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId: paramEventId, folderId: paramFolderId } = req.params;

    try {
      let files = await FilesService.getAllFolderFilesAdmin(
        parseInt(paramFolderId, 10),
        paramEventId
      );
      return res
        .status(200)
        .send(createApiResponse<FolderFileAttributes[]>(null, files));
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// GET SINGLE file
router.get(
  "/download/:fileName",
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileName } = req.params;
    const s3Key = `files/1/${fileName}`; // TODO update the s3KeyPrefix
    const userDefinedFileName = await FilesService.getFileNameByS3FileName(
      fileName
    );

    try {
      await s3.getSingleFile(s3Key, res, userDefinedFileName);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

//create new folder
router.post('/createFolder', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventFolder = await FilesService.createFolder(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse<EventFolders>('Folder create successfully', eventFolder));
  } catch (err) {
    return next(err);
  }
});

//upload new files
router.post('/createFile', fileUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventFolder = JSON.parse(req.query.eventFolder as string);
    const createFileResponse = await FilesService.createFile(req.session.data.me, eventFolder?.eventId, eventFolder, req.file);
    return res.status(200).send(createApiResponse('File Modify successfully', ""));
  } catch (err) {
    return next(err);
  }
});

//update folder
router.post('/updateFolder', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventFolder = await FilesService.updateFolder(req.session.data.me, req.body?.eventId, req.body);
    return res.status(200).send(createApiResponse('Folder save successfully', ""));
  } catch (err) {
    return next(err);
  }
});

//delete uploaded file
router.post('/deleteFile', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await FilesService.deleteFile(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse('Delete File successfully', ""));
  } catch (err) {
    return next(err);
  }
});

//delete uploaded folder
router.post('/deleteFolder', requireRole([RoleLabel.SystemAdmin, RoleLabel.EventOrganizer, RoleLabel.EventSupporter]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await FilesService.deleteFolder(req.session.data.me, req.body);
    return res.status(200).send(createApiResponse('Delete Folder successfully', ""));
  } catch (err) {
    return next(err);
  }
});

export default router;
