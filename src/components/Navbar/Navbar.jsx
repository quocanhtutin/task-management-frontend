import React, { useState } from 'react'
import './Navbar.css'
import { Bell, Home, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate()

    return (
        <div className="navbar">
            <div className="navbar-left">
                <button className="icon-btn" onClick={() => navigate('/main/boards')}><Home /></button>
                <input type="text" placeholder="Tìm kiếm" className="search-input" />
            </div>
            <div className="navbar-right">
                <button className="icon-btn"><Plus /></button>
                <button className="icon-btn"><Bell /></button>
                <div className="menu-wrapper">
                    <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><User /></button>
                    {showMenu && (
                        <div className="dropdown-menu">
                            <ul>
                                <li>Tài khoản</li>
                                <li>Cài đặt</li>
                                <li>Chủ đề</li>
                                <li>Trợ giúp</li>
                                <li className="logout">Đăng xuất</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Navbar
