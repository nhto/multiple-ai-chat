//Material-UI
import ProtectedRoute from './../components/util/ProtectedRoute/ProtectedRoute';
import { Routes, Route, Outlet } from "react-router-dom";

import React from 'react';

import { isUser, isUserHoU, isUserCFSO, isUserEventOrganizer } from './../app/util';

import { useSelector } from 'react-redux';


function PageRouter() {
  const appState = useSelector((state) => state.app);

  return (
    <Routes>
      {/* <Route path={PAYMENT_PATHNAME} element={<Payment />} /> */}
      <Route element={<ProtectedRoute isAllowed={isUser(appState.me)} />}>
        <Route path="" element={<p>Home Page</p>} />
        {/* <Route path="register" element={<ViewEventRegistrationForm />} />
        <Route path="success" element={<SuccessfulRegistration />} />
        <Route path="waitList" element={<WaitList />} />
        <Route path="unacceptedUserType" element={<UnacceptedUserType />} />
        <Route path="eventFull" element={<EventFull />} />
        <Route path="regFormExpired" element={<RegFormExpired />} />
        <Route path="userHasRegistered" element={<RegistrationFound />} />
        <Route path={`${FILE_SUBMISSION_PATHNAME}/:submissionPath`} element={<FileSubmission />} />
        <Route path="abstract-submission" element={<AbstractSubmissionDialog />} />
        <Route path="update-abstract-submission" element={<AbstractSubmissionUpdateDialog />} />
        <Route path="endorse-comment/:eventId/:abstractId/" element={<EndorseCommentDialog />} />
        <Route path="under-discussion/:eventId/:abstractId/" element={<UnderDiscussionDialog />} />
        <Route path="paper-submission/:eventId/:abstractId/" element={<PaperSubmissionDialog />} />
        <Route path="successfulSubmit" element={<SuccessfulSubmit />} /> */}
      </Route>
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}

export default PageRouter;