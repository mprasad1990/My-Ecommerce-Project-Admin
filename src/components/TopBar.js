import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function TopBar() {

  const navigate = useNavigate();

  return (
    <header id="page-topbar">
      <div className="navbar-header">
        <div className="d-flex">
          <div className="navbar-brand-box">
            <Link to="/dashboard" className="logo logo-dark">
              <span className="logo-sm">
                <img src="/assets/images/logo-sm.png" alt="" height="22"/>
              </span>
              <span className="logo-lg">
                <img src="/assets/images/logo-dark.png" alt="" height="17"/>
              </span>
            </Link>
            <Link to="/dashboard" className="logo logo-light">
              <span className="logo-sm">
                <img src="/assets/images/logo-sm.png" alt="" height="22"/>
              </span>
              <span className="logo-lg">
                <img src="/assets/images/logo-light.png" alt="" style={{"width":"100%"}}/>
              </span>
            </Link>
          </div>
        </div>
        <div className="d-flex">
          <div className="d-inline-block">
            <button onClick={ () => { navigate('/logout') }} type="button" className="btn header-item noti-icon right-bar-toggle waves-effect">
                <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
