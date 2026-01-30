import { Routes, Route } from "react-router-dom";
import React from 'react';
import ChatPage from './ChatPage/ChatPage';

function PageRouter() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}

export default PageRouter;