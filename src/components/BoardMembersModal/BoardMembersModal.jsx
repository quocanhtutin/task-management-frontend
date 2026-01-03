import React, { useState, useEffect, useRef, useContext } from 'react';
import boardMemberService from '../../services/boardMemberService';
import workspaceMemberService from '../../services/workspaceMemberService';
import boardService from '../../services/boardService';
import workspaceService from '../../services/workspaceService';
import userService from '../../services/userService';
import { X, Trash2, UserPlus } from 'lucide-react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './BoardMembersModal.css';

const ROLES = {
    0: 'Viewer',
    1: 'Editor',
    2: 'Owner'
};

export default function BoardMembersModal({ boardId, boardName, onClose }) {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const _getLocal = (k) => {
        const v = localStorage.getItem(k);
        if (!v) return '';
        const s = String(v).trim();
        if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
        return s;
    };

    const currentUserEmail = _getLocal('email').toLowerCase();
    const currentUserName = _getLocal('name').toLowerCase();
    const currentUserId = (_getLocal('userId') || _getLocal('id') || '').toString();

    const currentMember = members.find(m => (m.email || '').toLowerCase() === currentUserEmail);
    const currentMemberByName = !currentMember && members.find(m => (m.name || '').toLowerCase() === currentUserName);
    const currentMemberById = (!currentMember && !currentMemberByName && currentUserId) ? members.find(m => String(m.userId) === String(currentUserId)) : null;

    const effectiveMember = currentMember || currentMemberByName || currentMemberById;

    const { currentWorkSpace, selectWorkspace } = useContext(StoreContext) || {};
    const navigate = useNavigate();

    const roleNum = effectiveMember ? Number(effectiveMember.role ?? 0) : 0;
    const workspaceOwnerMatch = currentWorkSpace && (
        String(currentWorkSpace.ownerId || currentWorkSpace.createdBy || currentWorkSpace.ownerUserId || '') === currentUserId ||
        (String(currentWorkSpace.ownerEmail || '').toLowerCase() === currentUserEmail)
    );
    const canManage = (effectiveMember && roleNum >= 1) || workspaceOwnerMatch;

    console.log('BoardMembersModal debug:', { currentUserEmail, currentUserName, currentUserId, currentMember: currentMember ?? null, currentMemberByName: currentMemberByName ?? null, currentMemberById: currentMemberById ?? null, effectiveMember, roleNum, workspaceOwnerMatch, canManage, currentWorkSpace });

    const [newUserId, setNewUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newUserRole, setNewUserRole] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    const wrapperRef = useRef(null);

    useEffect(() => {
        fetchMembers();
    }, [boardId]);

    const loadWorkspaceIfMissing = async () => {
        if (currentWorkSpace && currentWorkSpace.id) return;
        try {
            console.log('Attempting to fetch board to discover workspace...', { boardId });
            const res = await boardService.getBoard(boardId);
            const data = res.data?.value || res.data || {};
            const workspaceId = data.workspaceId || data.workspace?.id || data.WorkspaceId || data.Workspace?.id;
            if (workspaceId) {
                const wsRes = await workspaceService.getById(workspaceId);
                const wsData = wsRes.data?.value || wsRes.data || wsRes.data?.value?.workspace || wsRes.data;
                const workspace = wsData || {};
                if (selectWorkspace) selectWorkspace(workspace);
                console.log('Loaded workspace from board:', workspace);
            }
        } catch (err) {
            console.warn('Could not auto-load workspace from board:', err.response ?? err);
        }
    };

    useEffect(() => {
        loadWorkspaceIfMissing();
    }, [boardId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Cache workspace members once when the current workspace changes
    const [workspaceMembersCache, setWorkspaceMembersCache] = useState(null);
    const [workspaceMembersLoading, setWorkspaceMembersLoading] = useState(false);
    useEffect(() => {
        const fetchWorkspaceMembers = async () => {
            // Resolve workspace id from context, localStorage or board detail
            let wsId = currentWorkSpace?.id;
            if (!wsId) {
                // try localStorage common keys
                const tryKeys = ['workspaceId', 'currentWorkspaceId', 'currentWorkSpaceId', 'workSpaceId'];
                for (const k of tryKeys) {
                    const v = localStorage.getItem(k);
                    if (v) {
                        wsId = v;
                        if (process.env.NODE_ENV === 'development') console.log('Found workspace id in localStorage key', k, wsId);
                        break;
                    }
                }
            }

            if (!wsId && boardId) {
                try {
                    if (process.env.NODE_ENV === 'development') console.log('No workspace id in context/localStorage, attempting to load workspace via boardId', boardId);
                    const resB = await boardService.getBoard(boardId);
                    const dataB = resB.data?.value || resB.data || {};
                    wsId = dataB.workspaceId || dataB.workspace?.id || dataB.WorkspaceId || dataB.Workspace?.id;
                } catch (err) {
                    console.warn('Không thể lấy board để suy ra workspace:', err);
                }
            }

            if (!wsId) {
                console.error('MẤT ID WORKSPACE! Đang không biết lọc theo ai.');
                setWorkspaceMembersCache([]);
                return;
            }

            setWorkspaceMembersLoading(true);
            try {
                const res = await workspaceMemberService.getAllMembers(wsId);
                if (process.env.NODE_ENV === 'development') console.log('Workspace members raw (resolved wsId):', res.data);
                const wsMembers = res.data.value || res.data || [];
                const limited = Array.isArray(wsMembers) ? wsMembers.slice(0, 20) : [];
                setWorkspaceMembersCache(limited);
            } catch (err) {
                console.error('Lỗi tải danh sách thành viên Workspace:', err);
                // Set empty array to explicitly indicate "no workspace members"
                setWorkspaceMembersCache([]);
            } finally {
                setWorkspaceMembersLoading(false);
            }
        };
        fetchWorkspaceMembers();
    }, [currentWorkSpace?.id, boardId]);

    // NOTE: We no longer perform any global user search during typing. All suggestions MUST come from the workspace members cache.
    // Add a strict handleSearch function for immediate filtering without any API calls
    const handleSearch = (e) => {
        const keyword = (e.target.value || '').toString();
        setSearchQuery(keyword);

        const q = keyword.trim().toLowerCase();
        if (!q) {
            setSearchResults([]);
            return;
        }

        console.log('Danh sách gốc trong Workspace:', workspaceMembersCache);

        if (Array.isArray(workspaceMembersCache) && workspaceMembersCache.length > 0) {
            const filtered = workspaceMembersCache.filter(user => {
                const name = (user.name || user.userName || user.fullName || (user.user && (user.user.name || user.userName)) || '').toString().toLowerCase();
                const email = (user.email || (user.user && (user.user.email || user.userEmail)) || '').toString().toLowerCase();

                const nameMatch = name.includes(q);
                const emailMatch = email.includes(q);

                const isInBoard = members.some(m => String(m.userId) === String(user.userId || user.id || (user.user && (user.user.id || ''))) || (m.email || '').toLowerCase() === email);

                return (nameMatch || emailMatch) && !isInBoard;
            });

            console.log('Kết quả sau lọc:', filtered);

            const mapped = filtered.map(u => ({
                id: u.userId || u.id || (u.user && (u.user.id || u.user.userId)) || '',
                name: u.name || u.user?.name || u.userName || u.fullName || '',
                email: u.email || u.user?.email || u.user?.userEmail || '',
                avatarUrl: u.avatarUrl || u.user?.avatarUrl || ''
            }));

            setSearchResults(mapped);
        } else {
            console.warn('Chưa tải được danh sách thành viên Workspace hoặc Workspace rỗng!');
            setSearchResults([]);
        }
    };

    // Keep the debounced effect but ensure it no longer calls global search — it only ensures empty results are cleared when query cleared
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (!searchQuery.trim() || !showSuggestions) {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, showSuggestions]);

    const fetchMembers = async () => {
        try {
            const res = await boardMemberService.getAllMembers(boardId);
            const data = res.data.value || res.data || [];
            console.log('Fetched board members (raw):', data);
            const normalized = data.map(m => {
                const user = m.user || {};
                const email = m.email || user.email || m.userEmail || m.emailAddress || '';
                const name = m.name || user.name || m.fullName || '';
                const id = m.userId ?? m.id ?? user.id ?? user.userId ?? '';
                let role = m.role ?? m.roleId ?? m.roleValue ?? m.userRole ?? 0;
                if (typeof role === 'string') {
                    const rl = role.toLowerCase();
                    if (rl.includes('owner')) role = 2;
                    else if (rl.includes('editor') || rl.includes('admin')) role = 1;
                    else if (rl.includes('viewer') || rl.includes('member')) role = 0;
                    else {
                        const parsed = parseInt(role, 10);
                        role = isNaN(parsed) ? 0 : parsed;
                    }
                } else {
                    role = Number(role) || 0;
                }
                return { ...m, userId: id, email, name, role };
            });
            console.log('Fetched board members (normalized):', normalized);
            setMembers(normalized);
        } catch (error) {
            console.error("Lỗi tải thành viên:", error.response ?? error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setNewUserId(user.id);
        setSearchQuery(user.name || user.email);
        setShowSuggestions(false);
    };

    const isNotInWorkspaceError = (error) => {
        const msg = (error?.response?.data?.message || error?.response?.data?.value?.message || error?.message || '').toString();
        return /workspace/i.test(msg) || /not in workspace/i.test(msg) || /chưa trong workspace/i.test(msg) || /không.*workspace/i.test(msg);
    };

    const addToWorkspaceThenRetry = async (userId, roleToGive = 0) => {
        let workspaceId = currentWorkSpace?.id;
        if (!workspaceId) {
            await loadWorkspaceIfMissing();
            workspaceId = currentWorkSpace?.id;
        }
        if (!workspaceId) {
            try {
                console.log('Attempting fallback: fetching board to get workspaceId', { boardId });
                const resB = await boardService.getBoard(boardId);
                const dataB = resB.data?.value || resB.data || {};
                workspaceId = dataB.workspaceId || dataB.workspace?.id || dataB.WorkspaceId || dataB.Workspace?.id;
                console.log('Fallback workspaceId from board:', workspaceId);
            } catch (err) {
                console.warn('Board fetch fallback failed:', err.response ?? err);
            }
        }

        if (!workspaceId) {
            alert('Không xác định Workspace hiện tại. Vui lòng vào trang Workspace và chọn Workspace trước khi thử lại.');
            return false;
        }

        if (!window.confirm('Người này chưa nằm trong Workspace. Thêm họ vào Workspace trước khi thêm vào Board?')) return false;
        try {
            console.log('Adding user to workspace', { workspaceId, userId, role: Number(roleToGive) });
            const res = await workspaceMemberService.addMember(workspaceId, userId, roleToGive);
            console.log('Add to workspace response:', res);
            if (!currentWorkSpace || !currentWorkSpace.id) {
                try {
                    const wsRes = await workspaceService.getById(workspaceId);
                    const wsData = wsRes.data?.value || wsRes.data || wsRes.data?.value?.workspace || wsRes.data;
                    if (selectWorkspace) selectWorkspace(wsData);
                    console.log('Loaded workspace after add:', wsData);
                } catch (e) {
                    console.warn('Could not load workspace details after add', e.response ?? e);
                }
            }
            alert('Đã thêm vào Workspace thành công. Tiếp tục thêm vào Board...');
            return true;
        } catch (err) {
            console.error('Add to workspace failed:', err.response ?? err);
            const msg = err.response?.data?.message || err.response?.data?.value?.message || err.message || 'Không thể thêm vào Workspace';
            if (err.response?.status === 403 || /Bạn không thuộc WorkSpace/i.test(msg) || /forbidden/i.test(err.response?.statusText ?? '')) {
                if (window.confirm('Bạn không có quyền thay đổi Workspace. Mở trang quản lý Thành viên Workspace để yêu cầu quyền?')) {
                    if (currentWorkSpace && currentWorkSpace.name) {
                        navigate(`/workspace/${currentWorkSpace.name}/members`);
                    } else if (workspaceId) {
                        try {
                            const wsRes = await workspaceService.getById(workspaceId);
                            const wsData = wsRes.data?.value || wsRes.data || wsRes.data?.value?.workspace || wsRes.data;
                            if (wsData && wsData.name) {
                                navigate(`/workspace/${wsData.name}/members`);
                            } else {
                                window.location.href = '/main/boards';
                            }
                        } catch (e) {
                            window.location.href = '/main/boards';
                        }
                    } else {
                        window.location.href = '/main/boards';
                    }
                }
                return false;
            }
            alert('Lỗi thêm vào Workspace: ' + msg);
            return false;
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!canManage) {
            alert('Bạn không có quyền thêm thành viên vào Board.');
            return;
        }
        if (!newUserId.trim()) {
            alert("Vui lòng chọn một thành viên từ danh sách tìm kiếm!");
            return;
        }

        try {
            if (members.some(m => String(m.userId) === String(newUserId))) {
                alert('Người này đã có trong Board.');
                return;
            }
            setIsAdding(true);
            console.log('Adding member', { boardId, userId: newUserId, role: Number(newUserRole) });
            await boardMemberService.addMember(boardId, newUserId, newUserRole);
            alert("Thêm thành viên thành công!");

            setNewUserId('');
            setSearchQuery('');
            fetchMembers();
        } catch (error) {
            console.error('Add member error:', error.response ?? error);
            if (isNotInWorkspaceError(error)) {
                const added = await addToWorkspaceThenRetry(newUserId);
                if (added) {
                    try {
                        await boardMemberService.addMember(boardId, newUserId, newUserRole);
                        alert('Đã thêm thành viên vào Board sau khi thêm vào Workspace.');
                        setNewUserId('');
                        setSearchQuery('');
                        fetchMembers();
                        return;
                    } catch (err2) {
                        console.error('Retry add member failed:', err2.response ?? err2);
                        const msg2 = err2.response?.data?.message || err2.response?.data?.value?.message || err2.message || 'Không thể thêm thành viên sau khi thêm vào Workspace';
                        alert('Lỗi thêm vào Board: ' + msg2);
                        return;
                    }
                }
            }
            const msg = error.response?.data?.message || error.response?.data?.value?.message || (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) || error.message || 'Không thể thêm thành viên';
            alert("Lỗi: " + msg);
        } finally {
            setIsAdding(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            console.log('Updating role', { boardId, userId, newRole: Number(newRole) });
            await boardMemberService.updateRole(boardId, userId, newRole);
            setMembers(prev => prev.map(m =>
                m.userId === userId ? { ...m, role: Number(newRole) } : m
            ));
        } catch (error) {
            console.error('Update role error:', error.response ?? error);
            const msg = error.response?.data?.message || error.response?.data?.value?.message || error.message || 'Bạn không có quyền đổi role này.';
            if (isNotInWorkspaceError(error)) {
                const added = await addToWorkspaceThenRetry(userId);
                if (added) {
                    try {
                        await boardMemberService.updateRole(boardId, userId, newRole);
                        setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: Number(newRole) } : m));
                        alert('Đã cập nhật role sau khi thêm vào Workspace.');
                        return;
                    } catch (err2) {
                        console.error('Retry update role failed:', err2.response ?? err2);
                        alert('Lỗi cập nhật role: ' + (err2.response?.data?.message || err2.message || 'Không thể cập nhật role sau khi thêm vào Workspace.'));
                        return;
                    }
                }
            }
            alert("Lỗi: " + msg);
            fetchMembers();
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Bạn chắc chắn muốn mời thành viên này ra khỏi Board?")) return;
        try {
            console.log('Removing member', { boardId, userId });
            await boardMemberService.removeMember(boardId, userId);
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (error) {
            console.error('Remove member error:', error.response ?? error);
            if (isNotInWorkspaceError(error)) {
                const added = await addToWorkspaceThenRetry(userId);
                if (added) {
                    try {
                        await boardMemberService.removeMember(boardId, userId);
                        setMembers(prev => prev.filter(m => m.userId !== userId));
                        alert('Đã mời ra khỏi Board sau khi thêm vào Workspace.');
                        return;
                    } catch (err2) {
                        console.error('Retry remove failed:', err2.response ?? err2);
                        alert('Lỗi xóa thành viên: ' + (err2.response?.data?.message || err2.message || 'Không thể xóa sau khi thêm vào Workspace.'));
                        return;
                    }
                }
            }
            const msg = error.response?.data?.message || error.response?.data?.value?.message || error.message || 'Xóa thất bại';
            alert("Lỗi: " + msg);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content member-modal" style={{ maxWidth: '600px', minHeight: '500px' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h3>Thành viên board: {boardName || 'Board'}</h3>
                        <div style={{ fontSize: '12px', color: '#6b778c' }}>
                            Quyền của bạn: {effectiveMember ? (ROLES[Number(effectiveMember.role)] || `Role ${effectiveMember.role}`) : 'Bạn không thuộc Board'}
                        </div>
                        {process.env.NODE_ENV === 'development' && effectiveMember && (
                            <div style={{ fontSize: '12px', color: '#6b778c', marginTop: '6px' }}>
                                (Debug role raw: {String(effectiveMember.role)})
                            </div>
                        )}
                    </div>
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
                                    handleSearch(e);
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
                                            {workspaceMembersLoading ? (
                                        <div style={{ padding: '10px', color: '#888', textAlign: 'center' }}>Đang tải danh sách thành viên Workspace...</div>
                                    ) : searchResults.length > 0 ? (
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
                            disabled={!canManage}
                        >
                            {Object.entries(ROLES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn-primary" disabled={isAdding || !canManage}>
                            {isAdding ? '...' : <UserPlus size={18} />}
                        </button>
                    </form>
                    {newUserId && <div style={{ marginTop: '5px', fontSize: '12px', color: 'green' }}>Đã chọn: {searchQuery}</div>}
                    {!canManage && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#b12704' }}>
                            Bạn không có quyền thêm/sửa/xóa thành viên. Yêu cầu Admin hoặc Owner để thay đổi thành viên Board.
                        </div>
                    )}
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
                                                    value={Number(member.role ?? 0)}
                                                    onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                                                    style={{ padding: '5px', borderRadius: '4px' }}
                                                    disabled={!canManage}
                                                >
                                                    {Object.entries(ROLES).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    style={{ color: 'red', background: 'none', border: 'none', cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.5 }}
                                                    title={canManage ? "Xóa thành viên" : "Bạn không có quyền"}
                                                    disabled={!canManage}
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