import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function VerticalMenu() {

  let location = useLocation();

  const [menuWithSubmenu, setMenuWithSubmenu] = useState({
    'dashboard': false,
    'banners': false,
    'products': false,
    'contacts': false,
    'subscribers': false
  });

  const openSubmenu = (menu) => {
    Object.keys(menuWithSubmenu).forEach(function(key, value) {
      if(menu !== key){
        menuWithSubmenu[key] = false;
      }
    })
    menuWithSubmenu[menu] = !menuWithSubmenu[menu];
    setMenuWithSubmenu(menuWithSubmenu);
  }

  return (
    <div className="vertical-menu">
      <div data-simplebar className="h-100">
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className={`${(location.pathname === "/" || location.pathname === "/dashboard") ? "mm-active" : ""}`} onClick={ () => {openSubmenu("dashboard")}}>
              <Link to="/dashboard" className="waves-effect">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className={`${(location.pathname === "/calendar") ? "mm-active" : ""}`}  onClick={ () => {openSubmenu("banners")}}>
              <Link to="/banners" className="waves-effect">
                <i className="fas fa-images"></i>
                <span>Banners</span>
              </Link>
            </li>

            <li className={`${(location.pathname === "/makeup" || location.pathname === "/skincare" || location.pathname === "/haircare" || menuWithSubmenu.products) ? "mm-active" : ""}`} onClick={ () => {openSubmenu("products")}}>
              <Link to="#" className="has-arrow waves-effect">
                <i className="fab fa-product-hunt"></i>
                <span>Products</span>
              </Link>
              {(location.pathname === "/makeup" || location.pathname === "/skincare" || location.pathname === "/haircare" || menuWithSubmenu.products) && <ul className="sub-menu">
                <li><Link to="/makeup">Makeup</Link></li>
                <li><Link to="/skincare">Skin Care</Link></li>
                <li><Link to="/haircare">Hair Care</Link></li>
              </ul>}
            </li>

            <li className={`${(location.pathname === "/contacts") ? "mm-active" : ""}`}  onClick={ () => {openSubmenu("contacts")}}>
              <Link to="/contacts" className="waves-effect">
                <i className="fas fa-inbox"></i>
                <span>Contacts</span>
              </Link>
            </li>

            <li className={`${(location.pathname === "/subscribers") ? "mm-active" : ""}`} onClick={ () => {openSubmenu("subscribers")}}>
              <Link to="/subscribers" className="waves-effect">
                <i className="fas fa-users"></i>
                <span>Subscribers</span>
              </Link>
            </li>

            <li>
              <Link to="/logout" className="waves-effect">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </div>
  )
}
