import { useState } from "react";
import AlertContext from "./AlertContext";

const AlertState = (props) => {

    const [alertMessage, setAlertMessage] = useState({
        show: false,
        type: "success",
        message: ""
    });

    return (
      <AlertContext.Provider value={{alertMessage, setAlertMessage}}>
        {props.children}
      </AlertContext.Provider>
    );

}

export default AlertState;