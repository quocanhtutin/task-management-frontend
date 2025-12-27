import React, { useState, useEffect, useRef } from 'react';
import workspaceMemberService from '../../services/workspaceMemberService';
import userService from '../../services/userService';
import { X, Trash2, UserPlus } from 'lucide-react';
import './WorkspaceMembersModal.css';

const ROLES = {
    0: 'Member',
    1: 'Admin',
    2: 'Owner'
};

export default function WorkspaceMembersModal({ workspace, onClose }) {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newUserId, setNewUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newUserRole, setNewUserRole] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    const wrapperRef = useRef(null);

    useEffect(() => {
        fetchMembers();
    }, [workspace.id]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0 && showSuggestions) {
                try {
                    const res = await userService.search(searchQuery);

                    const users = res.data.value?.items || [];

                    const existingIds = members.map(m => m.userId);
                    const filteredUsers = users.filter(u => !existingIds.includes(u.id));

                    setSearchResults(filteredUsers);
                } catch (error) {
                    console.error("Lỗi tìm kiếm user:", error);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, showSuggestions, members]);

    const fetchMembers = async () => {
        try {
            const res = await workspaceMemberService.getAllMembers(workspace.id);
            setMembers(res.data.value || res.data || []);
        } catch (error) {
            console.error("Lỗi tải thành viên:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setNewUserId(user.id);
        setSearchQuery(user.name || user.email);
        setShowSuggestions(false);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newUserId.trim()) {
            alert("Vui lòng chọn một thành viên từ danh sách tìm kiếm!");
            return;
        }

        try {
            setIsAdding(true);
            await workspaceMemberService.addMember(workspace.id, newUserId, newUserRole);
            alert("Thêm thành viên thành công!");

            setNewUserId('');
            setSearchQuery('');
            fetchMembers();
        } catch (error) {
            console.error(error);
            alert("Lỗi: Không thể thêm thành viên (Kiểm tra xem họ đã trong nhóm chưa).");
        } finally {
            setIsAdding(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await workspaceMemberService.updateRole(workspace.id, userId, newRole);
            setMembers(prev => prev.map(m =>
                m.userId === userId ? { ...m, role: Number(newRole) } : m
            ));
        } catch (error) {
            alert("Lỗi: Bạn không có quyền đổi role này.");
            fetchMembers();
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Bạn chắc chắn muốn mời thành viên này ra khỏi Workspace?")) return;
        try {
            await workspaceMemberService.removeMember(workspace.id, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (error) {
            alert("Xóa thất bại! Có thể đây là Owner hoặc bạn không đủ quyền.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content member-modal" style={{ maxWidth: '600px', minHeight: '500px' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Thành viên: {workspace.name}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <div className="add-member-section" style={{ background: '#f4f5f7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>Thêm thành viên</h4>
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>

                        <div style={{ flex: 1, position: 'relative', zIndex: 100 }} ref={wrapperRef}>
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                    if (e.target.value === '') setNewUserId('');
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />

                            {showSuggestions && searchQuery && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    background: 'white', border: '1px solid #ddd', borderRadius: '4px',
                                    marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                style={{
                                                    padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee',
                                                    display: 'flex', alignItems: 'center', gap: '10px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt="avatar"
                                                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '24px', height: '24px', background: '#0079bf', color: 'white',
                                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                                    }}>
                                                        {(user.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}

                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                                        {user.name || 'No Name'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '10px', color: '#888', textAlign: 'center', fontSize: '13px' }}>
                                            Không tìm thấy kết quả
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            {Object.entries(ROLES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn-primary" disabled={isAdding}>
                            {isAdding ? '...' : <UserPlus size={18} />}
                        </button>
                    </form>
                    {newUserId && <div style={{ marginTop: '5px', fontSize: '12px', color: 'green' }}>Đã chọn: {searchQuery}</div>}
                </div>

                <div className="members-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {isLoading ? <p>Đang tải...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Tên / ID</th>
                                    <th style={{ padding: '10px' }}>Ngày tham gia</th>
                                    <th style={{ padding: '10px' }}>Vai trò</th>
                                    <th style={{ padding: '10px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.userId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{member.name || 'No Name'}</div>
                                            <div style={{ fontSize: '11px', color: '#888' }}>{member.email}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                                                style={{ padding: '5px', borderRadius: '4px' }}
                                            >
                                                {Object.entries(ROLES).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleRemoveMember(member.userId)}
                                                style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="Xóa thành viên"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}