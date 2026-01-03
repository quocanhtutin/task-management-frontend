import React, { useState, useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Layout, FileStack, Home, Users, Settings, ChevronDown, ChevronRight, CirclePlus } from 'lucide-react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Sidebar = () => {
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeWorkspace, setActiveWorkspace] = useState(1);
    const { workSpaces, setWorkSpaces, url, accessToken, setCurrentWorkSpace, selectWorkspace, currentWorkSpace } = useContext(StoreContext)
    const [showAddWorkspace, setShowAddWorkSpace] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    const [workSpace, setWorkSpace] = useState({
        name: "",
        description: "",
        background: "",
        type: 0,
    })

    const colors = [
        "#0079BF", "#61BD4F", "#F2D600", "#FF9F1A",
        "#EB5A46", "#C377E0", "#00C2E0", "#344563"
    ];

    const workspaceTypes = [
        { label: "Human Resources", value: 1 },
        { label: "Operations", value: 2 },
        { label: "Business CRM", value: 3 },
        { label: "Small Business", value: 4 },
        { label: "Education", value: 5 },
        { label: "Marketing", value: 6 },
        { label: "Engineering & IT", value: 7 },
        { label: "Other", value: 8 },
    ];

    const handleChangeWs = (event) => {
        const name = event.target.id;
        const value = event.target.value;
        setWorkSpace(workSpace => ({ ...workSpace, [name]: value }))
    }

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
                <NavLink to="/main/boards" className="sidebar-option" data-title="Bảng">
                    <Layout size={18} />
                    <p>Bảng</p>
                </NavLink>

                <div
                    className={`sidebar-option`}
                    onClick={() => setShowTemplates(!showTemplates)}
                    data-title="Mẫu"
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

                <NavLink to="/home" className="sidebar-option" data-title="Trang chủ">
                    <Home size={18} />
                    <p>Trang chủ</p>
                </NavLink>

                <NavLink to="/main/settings" className="sidebar-option" data-title="Cài đặt">
                    <Settings size={18} />
                    <p>Cài đặt</p>
                </NavLink>
            </div>

        </div >
    );
};

export default Sidebar;
