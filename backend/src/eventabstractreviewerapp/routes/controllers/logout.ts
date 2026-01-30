import express, { Request, Response } from 'express';
import logger from '../../../utilities/logger';

const router = express.Router();

router.get('/logout', async (req: Request, res: Response) => {
  const logoutUrl = req.session.data?.logoutUrl;
  try {
    req.session.destroy(() => null);
  }
  catch (error) {
    logger.warn("Error thrown on /logout");
    logger.warn(error);
  }

  return res.status(200).redirect(logoutUrl);
});


export default router;