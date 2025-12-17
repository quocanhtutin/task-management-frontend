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
            </div>
            <div className="workspace">
                <div className="workspace-header">
                    <h2>Không gian làm việc</h2>
                    <CirclePlus size={22} onClick={() => setShowAddWorkSpace(!showAddWorkspace)} />
                </div>

                <div className={`add-workspace ${showAddWorkspace ? "open" : ""}`}>
                    <h3>Tạo không gian làm việc</h3>

                    {/* NAME */}
                    <div className="form-group">
                        <label>Tên</label>
                        <input
                            id="name"
                            value={workSpace.name}
                            onChange={handleChangeWs}
                            placeholder="Nhập tên workspace"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label>Mô tả</label>
                        <input
                            id="description"
                            value={workSpace.description}
                            onChange={handleChangeWs}
                            placeholder="Mô tả ngắn"
                        />
                    </div>

                    {/* BACKGROUND */}
                    <div className="form-group">
                        <label>Background</label>
                        <div
                            className="color-input-ws"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                            <div
                                className="color-preview-ws"
                                style={{ background: workSpace.background || "#e4e6ea" }}
                            />
                            <span>{workSpace.background || "Chọn màu"}</span>
                        </div>

                        {showColorPicker && (
                            <div className="color-picker">
                                {colors.map(color => (
                                    <div
                                        key={color}
                                        className="color-item-ws"
                                        style={{ background: color }}
                                        onClick={() => {
                                            setWorkSpace(ws => ({ ...ws, background: color }));
                                            setShowColorPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TYPE */}
                    <div className="form-group">
                        <label>Loại workspace</label>
                        <div
                            className="type-input"
                            onClick={() => setShowTypePicker(!showTypePicker)}
                        >
                            {
                                workspaceTypes.find(t => t.value === workSpace.type)?.label
                                || "Chọn loại"
                            }
                        </div>

                        {showTypePicker && (
                            <div className="type-picker">
                                {workspaceTypes.map(type => (
                                    <div
                                        key={type.value}
                                        className="type-item"
                                        onClick={() => {
                                            setWorkSpace(ws => ({ ...ws, type: type.value }));
                                            setShowTypePicker(false);
                                        }}
                                    >
                                        {type.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SUBMIT */}
                    <button className="add-workspace-btn">
                        Thêm không gian
                    </button>
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
                                <NavLink to={`/workspace/${ws.name}/boards`} className="workspace-option">
                                    <Layout size={18} />
                                    <p>Bảng</p>
                                </NavLink>
                                <NavLink to={`/workspace/${ws.name}/members`} className="workspace-option">
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
