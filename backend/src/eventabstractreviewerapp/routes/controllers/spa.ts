import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import logger from '../../../utilities/logger';

const router = express.Router();
const spaPath = path.join(__dirname, '../../public');
const indexFileName = path.resolve(__dirname, '../../public/index.html');

// This SPA controller allows anonymous users to run the app
router.use(express.static(spaPath));
router.get('*', async (req: Request, res: Response) => {
  try {
    fs.stat(indexFileName, (error, stats) => {
      if (error) {
        return res.status(200).send("");
      }
      else {
        return res.sendFile(indexFileName);
      }
    });
  } catch (err) {
    logger.warn(`Unknown error cought from spaRouter: ${err}`);
    return res.status(200).send("");
  }
});

export default router;