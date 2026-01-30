/*
 * Reference:
 * https://www.robinwieruch.de/react-router-private-routes/
 */

import { Outlet } from "react-router-dom";

import UnauthorizedPage from "./UnauthorizedPage";

const ProtectedRoute = ({
  isAllowed,
  children,
}) => {

  return (
    <>
      {
        isAllowed ?
          !!children ?
            children
            :
            <Outlet />
          :
          <UnauthorizedPage />
      }
    </>
  );

};

export default ProtectedRoute;