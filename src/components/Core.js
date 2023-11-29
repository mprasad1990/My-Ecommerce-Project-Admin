import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopBar from './TopBar';
import VerticalMenu from './VerticalMenu';
import Dashboard from './Dashboard';
import Banners from './Banners';
import Makeup from './Makeup';
import Skincare from './Skincare';
import Haircare from './Haircare';
import Contacts from './Contacts';
import Subscribers from './Subscribers';
import Logout from './Logout';
import Footer from './Footer';
import Login from './Login';
import LoginContext from '../context/login/LoginContext';
import TestCropper from './TestCropper';

export default function Core() {

  const loginContext = useContext(LoginContext);

  const isLoggedIn = loginContext.loginState.is_logged_in;

  return (
    <BrowserRouter>
      {
        (isLoggedIn === true) && <div id="layout-wrapper">
          <TopBar/>
            <VerticalMenu/>
            <div className="main-content">
              <Routes>
                <Route exact path="/dashboard" element={<Dashboard/>}></Route>
                <Route exact path="/banners" element={<Banners/>}></Route>
                <Route exact path="/makeup" element={<Makeup/>}></Route>
                <Route exact path="/skincare" element={<Skincare/>}></Route>
                <Route exact path="/haircare" element={<Haircare/>}></Route>
                <Route exact path="/contacts" element={<Contacts/>}></Route>
                <Route exact path="/subscribers" element={<Subscribers/>}></Route>
                <Route exact path="/test-cropper" element={<TestCropper/>}></Route>
                <Route exact path="/logout" element={<Logout/>}></Route>
                <Route path="*" element={<Navigate to="/dashboard"/>}></Route>
              </Routes>
              <Footer/>
          </div>
        </div>
      }
      {
        (isLoggedIn === false) && <Routes>
          <Route exact path="/" element={<Login/>}></Route>
          <Route exact path="/login" element={<Login/>}></Route>
          <Route path="*" element={<Navigate to="/login"/>}></Route>
        </Routes>
      }
    </BrowserRouter>
  )
}
