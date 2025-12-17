import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Layout, FileStack, Home, Users, Settings, CreditCard, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = () => {
    const [showTemplates, setShowTemplates] = useState(false);

    return (
        <div className="sidebar">
            <div className="sidebar-options">
                <NavLink to="/boards" className="sidebar-option">
                    <Layout size={18} />
                    <p>Bảng</p>
                </NavLink>

                <div
                    className="sidebar-option template-toggle"
                    onClick={() => setShowTemplates(!showTemplates)}
                >
                    <FileStack size={18} />
                    <p>Mẫu</p>
                    {showTemplates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <div className={`template-wrapper ${showTemplates ? "open" : ""}`}>
                    <div className="template-list">
                        <NavLink to="/templates/business" className="template-item">Business</NavLink>
                        <NavLink to="/templates/design" className="template-item">Thiết kế</NavLink>
                        <NavLink to="/templates/education" className="template-item">Giáo dục</NavLink>
                        <NavLink to="/templates/engineering" className="template-item">Kỹ thuật</NavLink>
                        <NavLink to="/templates/marketing" className="template-item">Marketing</NavLink>
                    </div>
                </div>

                <NavLink to="/home" className="sidebar-option">
                    <Home size={18} />
                    <p>Trang chủ</p>
                </NavLink>

                <NavLink to="/members" className="sidebar-option">
                    <Users size={18} />
                    <p>Thành viên</p>
                </NavLink>

                <NavLink to="/settings" className="sidebar-option">
                    <Settings size={18} />
                    <p>Cài đặt</p>
                </NavLink>

                <NavLink to="/billing" className="sidebar-option">
                    <CreditCard size={18} />
                    <p>Thanh toán</p>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
