import React, {useContext, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoginContext from '../context/login/LoginContext';
import { API_SOURCE_URL } from '../utils/constants';
import Alert from './util/Alert';

export default function Login() {

  const loginContext = useContext(LoginContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    userpassword: ""
  });

  const [errorMessage, setErrorMessage] = useState({
    username: "",
    userpassword: ""
  })

  const [errorClass, setErrorClass] = useState({
    username: "",
    userpassword: ""
  })

  const [notificationMessage, setNotificationMessage] = useState({
    type: "success",
    message: ""
  });

  const validateFrom = () => {
    
    const fieldName = Object.keys(formData);
    
    let errorJson = {};
    let classJson = {};
    let errorCounter = 0;

    fieldName.forEach((element) => {
      if(formData[element].trim() === ""){
        errorJson[element] = "This field is required!";
        classJson[element] = "form-error";
        errorCounter++;
      }
      else{
        errorJson[element] = "";
        classJson[element] = "";
      }
    })

    setErrorMessage({ ...errorJson });
    setErrorClass({ ...classJson });

    return errorCounter;

  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let errorCounter = validateFrom();
    if(errorCounter > 0){
      return false;
    }
    else{
      const response = await fetch(`${API_SOURCE_URL}/admin/validate-user`, {
        method: 'POST',
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
  
      const json = await response.json();
  
      if(json.success){
        localStorage.setItem('token', json.authToken);
        loginContext.updateLoginState(true);
        setNotificationMessage({type: "success", message: "Login Successful!"});
        setTimeout(function(){
          navigate('/dashboard');
        }, 1000);
      }
      else{
        if(json.error){
          setNotificationMessage({type: "error", message: json.error});
        }
        else{
          setNotificationMessage({type: "error", message: "Something went wrong! Please try again."});
        }
      }
    }

  }

  return (

      <>
        <div className="accountbg" style={{ backgroundImage: `url("/assets/images/bg.jpg")`,  backgroundSize: `cover`, backgroundPosition: `center`}}></div>

        <div className="wrapper-page account-page-full">
          <div className="card shadow-none">
            <div className="card-block">
              <div className="account-box">
                <div className="card-box shadow-none p-4">
                  <div className="p-2">
                    <div className="text-center mt-4">
                      <Link to="/" className="logo logo-dark">
                        <span className="logo-lg">
                          <img src="/assets/images/logo-dark.png" alt="" style={{width: "100%"}}/>
                        </span>
                      </Link>
        
                      <Link to="/" className="logo logo-light">
                        <span className="logo-lg">
                          <img src="/assets/images/logo-dark.png" alt="" style={{width: "100%"}}/>
                        </span>
                      </Link>
                    </div>

                    <h4 className="font-size-18 mt-5 text-center">Welcome Back !</h4>
                    <p className="text-muted text-center">Sign in to continue to Admin.</p>

                    <form className="mt-4" name="loginForm" onSubmit={handleLoginSubmit}>
                      <div className={`mb-3 ${errorClass.username}`}>
                          <label className="form-label" htmlFor="username">Username</label>
                          <input type="text" className="form-control" id="username" name="username" placeholder="Enter username" onChange={handleChange}/>
                          <small className="error-mesg">{errorMessage.username}</small>
                      </div>
                      <div className={`mb-3 ${errorClass.userpassword}`}>
                          <label className="form-label" htmlFor="userpassword">Password</label>
                          <input type="password" className="form-control" id="userpassword" name="userpassword" placeholder="Enter password" onChange={handleChange}/>
                          <small className="error-mesg">{errorMessage.userpassword}</small>
                      </div>

                      <div className="mb-3 row">
                        <div className="col-sm-6">
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="customControlInline"/>
                            <label className="form-check-label" htmlFor="customControlInline">Remember me</label>
                          </div>
                        </div>
                        <div className="col-sm-6 text-end">
                          <button className="btn btn-primary w-md waves-effect waves-light" type="submit">Log In</button>
                        </div>
                      </div>

                    </form>
                    <div className="mt-5 pt-4 text-center">
                        <p>© 2023 Lakhi's Cosmetics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {notificationMessage.message && <Alert type={notificationMessage.type} message={notificationMessage.message}/>}
        </div>
      </>
        
  )
}
