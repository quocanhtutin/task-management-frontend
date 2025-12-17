import React, { useState, useEffect } from 'react';
import workspaceMemberService from '../../services/workspaceMemberService';
import { X, Trash2, UserPlus, Save } from 'lucide-react';
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
    const [newUserRole, setNewUserRole] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [workspace.id]);

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

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newUserId.trim()) return;

        try {
            setIsAdding(true);
            await workspaceMemberService.addMember(workspace.id, newUserId, newUserRole);
            alert("Thêm thành viên thành công!");
            setNewUserId('');
            fetchMembers();
        } catch (error) {
            alert("Lỗi: Không thể thêm thành viên (Kiểm tra lại UserID hoặc quyền hạn).");
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
            <div className="modal-content member-modal" style={{maxWidth: '600px'}}>
                <div className="modal-header" style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3>Thành viên: {workspace.name}</h3>
                    <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><X /></button>
                </div>

                <div className="add-member-section" style={{background: '#f4f5f7', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                    <h4>Thêm thành viên</h4>
                    <form onSubmit={handleAddMember} style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <input 
                            type="text" 
                            placeholder="Nhập UserID (UUID)..." 
                            value={newUserId}
                            onChange={(e) => setNewUserId(e.target.value)}
                            style={{flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                            required
                        />
                        <select 
                            value={newUserRole} 
                            onChange={(e) => setNewUserRole(e.target.value)}
                            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                        >
                            {Object.entries(ROLES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn-primary" disabled={isAdding}>
                            {isAdding ? '...' : <UserPlus size={18}/>}
                        </button>
                    </form>
                </div>

                <div className="members-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {isLoading ? <p>Đang tải...</p> : (
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
                                    <th style={{padding: '10px'}}>Tên / ID</th>
                                    <th style={{padding: '10px'}}>Ngày tham gia</th>
                                    <th style={{padding: '10px'}}>Vai trò</th>
                                    <th style={{padding: '10px'}}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.userId} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '10px'}}>
                                            <div style={{fontWeight: 'bold'}}>{member.name || 'No Name'}</div>
                                            <div style={{fontSize: '11px', color: '#888'}}>{member.userId}</div>
                                        </td>
                                        <td style={{padding: '10px'}}>
                                            {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{padding: '10px'}}>
                                            <select 
                                                value={member.role}
                                                onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                                                style={{padding: '5px', borderRadius: '4px'}}
                                            >
                                                {Object.entries(ROLES).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{padding: '10px', textAlign: 'center'}}>
                                            <button 
                                                onClick={() => handleRemoveMember(member.userId)}
                                                style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}
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