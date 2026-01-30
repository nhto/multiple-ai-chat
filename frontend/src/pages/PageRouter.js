//Material-UI
import ProtectedRoute from './../components/util/ProtectedRoute/ProtectedRoute';
import { Routes, Route, Outlet } from "react-router-dom";
import React from 'react';
import { useSelector } from 'react-redux';

function PageRouter() {

  return (
    <Routes>
      <Route>
        <Route path="" element={<p>Home Page</p>} />
      </Route>
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}

export default PageRouter;