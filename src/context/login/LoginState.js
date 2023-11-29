import LoginContext from "./LoginContext";
import { useState } from "react";

const LoginState = (props) => {

  const state = {
    "is_logged_in": ((localStorage.getItem("isLoggedIn")) ? true : false)
  }

  const [loginState, setLoginState] = useState(state);

  const updateLoginState = (value) => {
    setLoginState({"is_logged_in": value});
    if(value === true){
      localStorage.setItem("isLoggedIn", true);
    }
    else{
      localStorage.removeItem("isLoggedIn");
    }
    
  }

  return (
    <LoginContext.Provider value={{loginState, updateLoginState}}>
      {props.children}
    </LoginContext.Provider>
  )

}

export default LoginState;