import React, { useState, useEffect, useRef, useContext } from 'react';
import boardMemberService from '../../services/boardMemberService';
import workspaceMemberService from '../../services/workspaceMemberService';
import boardService from '../../services/boardService';
import workspaceService from '../../services/workspaceService';
import { X, Trash2, UserPlus } from 'lucide-react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './BoardMembersModal.css';

const ROLES = { 0: 'Member', 1: 'Admin', 2: 'Owner' };

export default function BoardMembersModal({ boardId, boardName, onClose }) {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentWorkSpace, selectWorkspace } = useContext(StoreContext) || {};
    const navigate = useNavigate();

    const _getLocal = (k) => {
        const v = localStorage.getItem(k);
        if (!v) return '';
        const s = String(v).trim();
        if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
        return s;
    };

    const currentUserEmail = _getLocal('email').toLowerCase();
    const currentUserId = (_getLocal('userId') || _getLocal('id') || '').toString();
    const effectiveMember = members.find(m => String(m.userId) === currentUserId || (m.email || '').toLowerCase() === currentUserEmail);
    const roleNum = effectiveMember ? Number(effectiveMember.role ?? 0) : 0;
    const canManage = roleNum >= 1;

    const [newUserId, setNewUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newUserRole, setNewUserRole] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [workspaceMembersCache, setWorkspaceMembersCache] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        fetchMembers();
    }, [boardId]);

    useEffect(() => {
        const fetchWorkspaceMembers = async () => {
            let wsId = currentWorkSpace?.id;
            if (!wsId) {
                try {
                    const resB = await boardService.getBoard(boardId);
                    wsId = resB.data?.value?.workspaceId || resB.data?.workspaceId;
                } catch (err) {}
            }
            if (wsId) {
                try {
                    const res = await workspaceMemberService.getAllMembers(wsId);
                    setWorkspaceMembersCache(res.data.value || res.data || []);
                } catch (err) {}
            }
        };
        fetchWorkspaceMembers();
    }, [boardId, currentWorkSpace]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        const q = val.trim().toLowerCase();
        if (!q || !workspaceMembersCache) {
            setSearchResults([]);
            return;
        }
        const filtered = workspaceMembersCache.filter(user => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const isInBoard = members.some(m => String(m.userId) === String(user.userId || user.id));
            return (name.includes(q) || email.includes(q)) && !isInBoard;
        });
        setSearchResults(filtered.map(u => ({
            id: u.userId || u.id,
            name: u.name,
            email: u.email
        })));
    };

    const fetchMembers = async () => {
        try {
            const res = await boardMemberService.getAllMembers(boardId);
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
            await boardMemberService.addMember(boardId, newUserId, newUserRole);
            setNewUserId('');
            setSearchQuery('');
            fetchMembers();
        } catch (error) {
            alert("Lỗi khi thêm thành viên");
        } finally {
            setIsAdding(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await boardMemberService.updateRole(boardId, userId, newRole);
            fetchMembers();
        } catch (error) {
            alert("Lỗi đổi quyền");
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Xóa thành viên khỏi Board?")) return;
        try {
            await boardMemberService.removeMember(boardId, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (error) {
            alert("Lỗi khi xóa");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content member-modal" style={{ maxWidth: '600px', minHeight: '400px' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3>Thành viên Board: {boardName}</h3>
                    <X onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div className="add-member-section" style={{ background: '#f4f5f7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>Thêm thành viên</h4>
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, position: 'relative' }} ref={wrapperRef}>
                            <input
                                placeholder="Tìm thành viên trong Workspace..."
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => setShowSuggestions(true)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            {showSuggestions && searchResults.length > 0 && (
                                <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #ddd', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                                    {searchResults.map(user => (
                                        <div key={user.id} onClick={() => { setNewUserId(user.id); setSearchQuery(user.name); setShowSuggestions(false); }} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                            {user.name} ({user.email})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} disabled={!canManage}>
                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <button type="submit" className="btn-primary" disabled={isAdding || !canManage}><UserPlus size={18} /></button>
                    </form>
                </div>

                <div className="members-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Thành viên</th>
                                <th style={{ padding: '10px' }}>Vai trò</th>
                                <th style={{ padding: '10px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => (
                                <tr key={m.userId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{m.name}</div>
                                        <small style={{ color: '#888' }}>{m.email}</small>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <select value={m.role} onChange={(e) => handleChangeRole(m.userId, e.target.value)} disabled={!canManage}>
                                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <Trash2 size={18} color="red" onClick={() => handleRemoveMember(m.userId)} style={{ cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.5 }} />
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