import React, { useState, useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Layout, FileStack, Home, Users, Settings, ChevronDown, ChevronRight, CirclePlus } from 'lucide-react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Sidebar = () => {
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState(1);
    const { workSpaces, setWorkSpaces, url, accessToken, setCurrentWorkSpace, selectWorkspace } = useContext(StoreContext)

    const fetchWorkspaces = async () => {
        try {
            const response = await axios.get(url + "/WorkSpace", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.data.isSuccess) {
                setWorkSpaces(response.data.value);
            }
        } catch (error) {
            console.error("Fetch workspace error:", error.response?.status);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchWorkspaces();
        }
        if (workSpaces) {
            setCurrentWorkSpace(workSpaces[0])
        }
    }, [accessToken]);


    return (
        <div className="sidebar">
            <div className="sidebar-options">
                <NavLink to="/boards" className="sidebar-option">
                    <Layout size={18} />
                    <p>Bảng</p>
                </NavLink>

                <div
                    className={`sidebar-option`}
                    onClick={() => setShowTemplates(!showTemplates)}
                >
                    <FileStack size={18} />
                    <p>Mẫu</p>
                    {showTemplates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className={`template-wrapper ${showTemplates ? "open" : ""}`}>
                    {/* {showTemplates && ( */}
                    <div className="template-list">
                        <NavLink to="/templates/business" className="template-item">Business</NavLink>
                        <NavLink to="/templates/design" className="template-item">Thiết kế</NavLink>
                        <NavLink to="/templates/education" className="template-item">Giáo dục</NavLink>
                        <NavLink to="/templates/engineering" className="template-item">Kỹ thuật</NavLink>
                        <NavLink to="/templates/marketing" className="template-item">Marketing</NavLink>
                    </div>
                    {/* )} */}
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
            </div>
            <div className="workspace">
                <div className="workspace-header">
                    <h2>Không gian làm việc</h2>
                    <CirclePlus size={22} />
                </div>

                <div className="workspace-list">
                    {workSpaces.map(ws => (
                        <div key={ws.id}>
                            <div

                                className={`workspace-item ${activeWorkspace === ws.id ? 'active' : ''}`}
                                onClick={() => { if (activeWorkspace === ws.id) { setActiveWorkspace('') } else { setActiveWorkspace(ws.id), setCurrentWorkSpace(ws) } }}
                            >
                                <div className="workspace-avatar">
                                    {ws.name.charAt(0)}
                                </div>
                                <h2>{ws.name}</h2>
                            </div>
                            <div className={`workspace-wrapper ${activeWorkspace === ws.id ? 'open' : ''}`}>
                                <NavLink to="/" className="workspace-option">
                                    <Layout size={18} />
                                    <p>Bảng</p>
                                </NavLink>
                                <NavLink to="/" className="workspace-option">
                                    <Users size={18} />
                                    <p>Thành viên</p>
                                </NavLink>
                                <NavLink to="/" className="workspace-option">
                                    <Settings size={18} />
                                    <p>Cài đặt</p>
                                </NavLink>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
