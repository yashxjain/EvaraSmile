import React, { useEffect, useState } from 'react';
import './sidebar.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import sidebarNav from '../../configs/sidebarNav';

const Sidebar = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate()
    // Fetch user role from localStorage (or it can come from a backend API or context)
    const userRole = localStorage.getItem('userRole'); // Assume roles are 'superadmin' or 'admin'

    useEffect(() => {
        const curPath = window.location.pathname.split('/')[1];
        const activeItem = sidebarNav.findIndex(item => item.section === curPath);
        setActiveIndex(curPath.length === 0 ? 0 : activeItem);
    }, [location]);

    const closeSidebar = () => {
        document.querySelector('.main__content').style.transform = 'scale(1) translateX(0)';
        setTimeout(() => {
            document.body.classList.remove('sidebar-open');
            document.querySelector('.main__content').style = '';
        }, 500);
    };

    // Filter menu items based on user role
    const filteredSidebarNav = sidebarNav.filter(item => {
        if (userRole === 'superadmin') {
            return true; // Superadmin can see all items
        } else if (userRole === 'admin') {
            return item.section !== 'offer'; // Admin cannot see Offers section
        }else if (userRole === 'order') {
            return item.section !== 'offer' && item.section !== 'stock' && item.section !== 'clients' && item.section !== 'products'; // Admin cannot see Offers section
        } else if (userRole === 'dealer') {
            return false; 
        }
        return false; // You can add more conditions for other roles
    });

    const handleLogout = () => {
        localStorage.clear(); // Clear local storage
        navigate("/")
     };
    return (
        <div className='sidebar'>
            <div className="sidebar__logo">
                <img src="https://namami-infotech.com/EvaraBackend/assets/sku/logo.png" alt="" />
                <div className="sidebar-close" onClick={closeSidebar}>
                    <i className='bx bx-x'></i>
                </div>
            </div>
            <div className="sidebar__menu">
                {
                    filteredSidebarNav.map((nav, index) => (
                        <Link 
                            to={nav.link} 
                            key={`nav-${index}`} 
                            className={`sidebar__menu__item ${activeIndex === index && 'active'}`} 
                            onClick={closeSidebar}
                        >
                            <div className="sidebar__menu__item__icon">
                                {nav.icon}
                            </div>
                            <div className="sidebar__menu__item__txt">
                                {nav.text}
                            </div>
                        </Link>
                    ))
                }
                <Link to="/" onClick={handleLogout} className="sidebar__menu__item" >
                    <div className="sidebar__menu__item__icon">
                        <i className='bx bx-log-out'></i>
                    </div>

                    <div className="sidebar__menu__item__txt">
                        Logout
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
