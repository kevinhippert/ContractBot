import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children, path }) {
  const { authorizedUser } = useAuth();
  const location = useLocation();

// XXX re-enable authorization before deploying
//  if (!authorizedUser) {
    // Redirect to login page if not authorized
//    return <Navigate to="/login" state={{ from: location }} replace />;
//  }

  return children; // Render the children if authorized
}

export default ProtectedRoute;
