import React, { useState } from 'react'
import './Navbar.css'
import { Bell, Home, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../utils/axiosConfig';

const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate()
    const location = useLocation();
    const isBoardPage = location.pathname.startsWith('/board/');

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const provider = localStorage.getItem('provider');

            await axiosClient.post('/Auth/Logout', {
                provider: provider,
                refreshToken: refreshToken
            });

        } catch (error) {
            console.error("Lỗi logout trên server:", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('provider');

            navigate('/login');
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setShowMenu(false);
    }

    return (
        <div className="navbar">
            {isBoardPage ?
                <div className="navbar-left">
                    <button className="icon-btn" onClick={() => navigate('/main/boards')}><Home /></button>
                    <input type="text" placeholder="Tìm kiếm" className="search-input" />
                </div>
                :
                <div className="navbar-left">
                    <h1
                        className="navbar-title"
                        onClick={() => navigate('/main/boards')}
                    >
                        HUST TASK MANAGEMENT
                    </h1>
                </div>
            }
            <div className="navbar-right">
                <button className="icon-btn"><Plus /></button>
                <button className="icon-btn"><Bell /></button>
                <div className="menu-wrapper">
                    <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><User /></button>
                    {showMenu && (
                        <div className="navbar-dropdown-menu">
                            <ul>
                                <li onClick={() => handleNavigate('/main/settings')}>Tài khoản</li>
                                <li>Cài đặt</li>
                                <li>Chủ đề</li>
                                <li>Trợ giúp</li>
                                <li><button onClick={handleLogout} className="logout-btn">
                                    Đăng xuất
                                </button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Navbar