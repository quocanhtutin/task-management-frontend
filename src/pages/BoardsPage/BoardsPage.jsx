import { useState, useEffect } from 'react';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';
import CreateWorkspaceModal, { WORKSPACE_TYPES } from '../../components/CreateWorkspaceModal/CreateWorkspaceModal.jsx'; // Import thêm constant WORKSPACE_TYPES
import WorkspaceMembersModal from '../../components/WorkspaceMembersModal/WorkspaceMembersModal.jsx';
import workspaceService from '../../services/workspaceService';
import './BoardsPage.css';
import { Trash2, Edit2, Users, Briefcase } from 'lucide-react';

export default function BoardsPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showCreateBoardPopup, setShowCreateBoardPopup] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const fetchWorkspaces = async () => {
        try {
            const response = await workspaceService.getAll();
            const data = response.data.value || response.data || [];
            setWorkspaces(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách Workspace:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const openCreateModal = () => {
        setSelectedWorkspace(null);
        setShowCreateWorkspace(true);
    };

    const openEditModal = (workspace) => {
        setSelectedWorkspace(workspace);
        setShowCreateWorkspace(true);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedWorkspace) {
                const wsId = selectedWorkspace.id || selectedWorkspace.Id;
                if (!wsId) { alert("Lỗi ID Workspace"); return; }
                const tasks = [];

                if (formData.name !== selectedWorkspace.name) tasks.push(() => workspaceService.updateName(wsId, formData.name));
                
                const oldDesc = selectedWorkspace.description || '';
                const newDesc = formData.description || '';
                if (newDesc !== oldDesc) tasks.push(() => workspaceService.updateDescription(wsId, newDesc));

                if (Number(formData.type) !== Number(selectedWorkspace.type)) tasks.push(() => workspaceService.updateType(wsId, formData.type));

                if (formData.background !== selectedWorkspace.background) tasks.push(() => workspaceService.updateBackground(wsId, formData.background));

                if (tasks.length === 0) { setShowCreateWorkspace(false); return; }

                for (const task of tasks) {
                    await task();
                    await delay(500);
                }
                alert("Cập nhật thành công!");
            } else {
                await workspaceService.create(formData);
                alert("Tạo mới thành công!");
            }
            setShowCreateWorkspace(false);
            fetchWorkspaces();
        } catch (error) {
            console.error(error);
            alert("Đã có lỗi xảy ra!");
        }
    };

    const handleDeleteWorkspace = async (id) => {
        if (window.confirm("Xóa Workspace này?")) {
            try {
                await workspaceService.delete(id);
                fetchWorkspaces();
            } catch (error) {
                alert("Xóa thất bại. Bạn không phải Owner.");
            }
        }
    };

    if (isLoading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className="boards-page">
            <WorkspaceHeader />
            
            <div style={{marginBottom: '20px', textAlign: 'right'}}>
                 <button className="btn-create-ws" onClick={openCreateModal}>
                    + Tạo Workspace Mới
                 </button>
            </div>

            {workspaces.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa có Workspace nào.</p>
                    <button onClick={openCreateModal}>Tạo ngay!</button>
                </div>
            ) : (
                <div className="workspace-list">
                    {workspaces.map((ws) => (
                        <div key={ws.id || ws.Id} className="workspace-container" style={{marginBottom: '40px'}}>
                            <div className="workspace-header-info" style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
                                <div className="ws-avatar" style={{
                                    width:'40px', height:'40px', background: ws.background || '#0079bf', 
                                    color:'white', display:'flex', alignItems:'center', justifyContent:'center', 
                                    borderRadius:'4px', fontWeight:'bold', fontSize:'20px'
                                }}>
                                    {(ws.name || 'W').charAt(0).toUpperCase()}
                                </div>
                                
                                <div style={{flex: 1}}>
                                    <h3 style={{margin:0}}>{ws.name}</h3>
                                    <div style={{fontSize:'12px', color:'#666', display: 'flex', gap: '10px', alignItems: 'center', marginTop:'4px'}}>
                                        <span style={{display:'flex', alignItems:'center', gap:'4px', background:'#eee', padding:'2px 6px', borderRadius:'4px'}}>
                                            <Briefcase size={12}/> 
                                            {WORKSPACE_TYPES[ws.type] || 'Khác'}
                                        </span>

                                        {ws.description && <span style={{color: '#888'}}>• {ws.description}</span>}
                                    </div>
                                </div>
                                
                                <div className="ws-actions">
                                    <button onClick={() => openEditModal(ws)} title="Sửa">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button onClick={() => { setSelectedWorkspace(ws); setShowMembersModal(true); }} title="Thành viên">
                                        <Users size={16}/>
                                    </button>
                                    <button onClick={() => handleDeleteWorkspace(ws.id || ws.Id)} title="Xóa" style={{color:'red'}}>
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>

                            <div className="user-board-cards">
                                <BoardCard title="Demo Board" color="#0079BF" />
                                <BoardCard title="Create board" add color="#E2E4E6" showPopup={() => setShowCreateBoardPopup(true)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateWorkspace && (
                <CreateWorkspaceModal 
                    onClose={() => setShowCreateWorkspace(false)} 
                    onSubmit={handleFormSubmit}
                    initialData={selectedWorkspace}
                />
            )}

            {showMembersModal && selectedWorkspace && (
                <WorkspaceMembersModal 
                    workspace={selectedWorkspace}
                    onClose={() => setShowMembersModal(false)}
                />
            )}

            {showCreateBoardPopup && (
                <CreateBoardPopup onClose={() => setShowCreateBoardPopup(false)} addNewBoard={() => {}} />
            )}
        </div>
    );
}