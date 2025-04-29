import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SessionTimeout() {
  const { authorizedUser, setAuthorizedUser } = useAuth();
  const navigate = useNavigate();
  const timeoutId = useRef(null);
  const timeout = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    if (authorizedUser.isAuthenticated) {
      timeoutId.current = setTimeout(() => {
        setAuthorizedUser({ userName: null, isAuthenticated: false });
        navigate("/login");
      }, timeout);

      return () => {
        clearTimeout(timeoutId.current);
      };
    }
  }, [authorizedUser, navigate, setAuthorizedUser]);

  return null; // This component doesn't render anything on to the page
}

export default SessionTimeout;
