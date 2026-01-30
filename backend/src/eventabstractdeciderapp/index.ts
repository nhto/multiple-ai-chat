/**
 * Module dependencies.
 */
import '../utilities/config';
import '../repo';
import app from './framework/app'
import startServer from './framework/http';
import { initAsync as initPolyuSsoAsync } from '../utilities/polyusso';
import { initAsync as initKeycloakAsync } from '../utilities/keycloak';
import { KeycloakLoginType } from '../models/model'

(async () => {
  await initPolyuSsoAsync();
  await initKeycloakAsync(KeycloakLoginType.alumni);
  await initKeycloakAsync(KeycloakLoginType.public);
})();
startServer(app);