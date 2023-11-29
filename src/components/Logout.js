import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginContext from '../context/login/LoginContext';

export default function Logout() {

  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);

  useEffect(() => {
    loginContext.updateLoginState(false);
    navigate("/login");
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      
    </div>
  )
}
