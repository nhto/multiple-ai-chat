import * as olppapi from '../utilities/olppapi';
import { ApiError, apiUnauthorizedError } from '../models/error';
import { MeSummary, RoleLabel } from '../models/model';
import { hasAnyRole } from "./authn";
import { AppConfig } from '../repo/config';

import logger from "../utilities/logger";

async function get(me: MeSummary): Promise<any> {
  if (!hasAnyRole(me, RoleLabel.User)) throw apiUnauthorizedError;

  try {
    const config = await AppConfig.findAll();
    const configResponse = config.map(c => { return {
      id: c.configId,
      value: c.value
    }});

    return configResponse;
  } catch (err) {
    logger.error(err);
    throw new ApiError("Failed to get app config.");
  }
}

export { get };