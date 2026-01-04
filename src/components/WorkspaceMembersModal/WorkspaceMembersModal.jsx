import React, { useState, useEffect, useRef } from 'react';
import workspaceMemberService from '../../services/workspaceMemberService';
import userService from '../../services/userService';
import { X, Trash2, UserPlus } from 'lucide-react';
import InviteLinkManager from '../InviteLinkManager/InviteLinkManager';
import './WorkspaceMembersModal.css';

const ROLES = { 0: 'Member', 1: 'Admin', 2: 'Owner' };

export default function WorkspaceMembersModal({ workspace, onClose }) {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newUserId, setNewUserId] = useState('');
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
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0 && showSuggestions) {
                try {
                    const res = await userService.search(searchQuery);
                    const users = res.data.value?.items || [];
                    const existingIds = members.map(m => m.userId);
                    setSearchResults(users.filter(u => !existingIds.includes(u.id)));
                } catch (error) {
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
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newUserId) return;
        try {
            setIsAdding(true);
            await workspaceMemberService.addMember(workspace.id, newUserId, newUserRole);
            setNewUserId('');
            setSearchQuery('');
            fetchMembers();
        } catch (error) {
            alert("Không thể thêm thành viên");
        } finally {
            setIsAdding(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await workspaceMemberService.updateRole(workspace.id, userId, newRole);
            fetchMembers();
        } catch (error) {
            alert("Lỗi phân quyền");
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Xóa thành viên này?")) return;
        try {
            await workspaceMemberService.removeMember(workspace.id, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (error) {
            alert("Lỗi khi xóa");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content member-modal" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Thành viên: {workspace.name}</h3>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <InviteLinkManager type={0} targetId={workspace.id || workspace.Id} />

                <div style={{ background: '#f4f5f7', padding: '15px', borderRadius: '8px', marginBottom: '20px', marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Thêm trực tiếp</h4>
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }} ref={wrapperRef}>
                            <input
                                placeholder="Tên hoặc email..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            {showSuggestions && searchQuery && (
                                <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #ddd', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                                    {searchResults.map(user => (
                                        <div key={user.id} onClick={() => { setNewUserId(user.id); setSearchQuery(user.name); setShowSuggestions(false); }} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                            {user.name} ({user.email})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <button type="submit" className="btn-primary" disabled={isAdding}><UserPlus size={18} /></button>
                    </form>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Thành viên</th>
                                <th style={{ padding: '10px' }}>Vai trò</th>
                                <th style={{ padding: '10px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.userId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                        <small style={{ color: '#888' }}>{member.email}</small>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <select value={member.role} onChange={(e) => handleChangeRole(member.userId, e.target.value)}>
                                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <Trash2 size={18} color="red" onClick={() => handleRemoveMember(member.userId)} style={{ cursor: 'pointer' }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}