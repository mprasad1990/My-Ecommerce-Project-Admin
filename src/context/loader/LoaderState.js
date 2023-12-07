import { useState } from "react";
import LoaderContext from "./LoaderContext";

const LoaderState = (props) => {

    const [loaderState, setLoaderState] = useState("hide");

    return (
      
      <LoaderContext.Provider value={{loaderState, setLoaderState}}>
        {props.children}
      </LoaderContext.Provider>

    );

}

export default LoaderState;