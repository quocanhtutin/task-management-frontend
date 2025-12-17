import { useState, useEffect } from 'react';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';
import CreateWorkspaceModal from '../../components/CreateWorkspaceModal/CreateWorkspaceModal.jsx';
import workspaceService from '../../services/workspaceService';
import './BoardsPage.css';
import { Trash2, Edit2 } from 'lucide-react';

export default function BoardsPage() {
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showCreateBoardPopup, setShowCreateBoardPopup] = useState(false);

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

                const tasks = [];
                const wsId = selectedWorkspace.id;

                if (!wsId) {
                    console.error("Lỗi: Không tìm thấy ID của workspace!", selectedWorkspace);
                    alert("Lỗi dữ liệu: Không tìm thấy ID Workspace.");
                    return;
                }

                if (formData.name !== selectedWorkspace.name) {
                    tasks.push(() => workspaceService.updateName(wsId, formData.name));
                }

                const oldDesc = selectedWorkspace.description || '';
                const newDesc = formData.description || '';
                if (newDesc !== oldDesc) {
                    tasks.push(() => workspaceService.updateDescription(wsId, newDesc));
                }

                if (Number(formData.type) !== Number(selectedWorkspace.type)) {
                    tasks.push(() => workspaceService.updateType(wsId, formData.type));
                }

                if (formData.background !== selectedWorkspace.background) {
                    tasks.push(() => workspaceService.updateBackground(wsId, formData.background));
                }

                if (tasks.length === 0) {
                    setShowCreateWorkspace(false);
                    return;
                }

                for (const task of tasks) {
                    await task();
                    await delay(500);
                }

                alert("Cập nhật Workspace thành công!");

            } else {
                await workspaceService.create(formData);
                alert("Tạo Workspace thành công!");
            }
            
            setShowCreateWorkspace(false);
            fetchWorkspaces();
        } catch (error) {
            console.error(error);
            alert("Đã có lỗi xảy ra! Có thể bạn không có quyền thực hiện hành động này hoặc kết nối không ổn định.");
        }
    };

    const handleDeleteWorkspace = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Workspace này? Hành động không thể hoàn tác!")) {
            try {
                await workspaceService.delete(id);
                fetchWorkspaces();
            } catch (error) {
                alert("Xóa thất bại. Chỉ Owner mới có quyền xóa.");
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
                    <p>Bạn chưa tham gia Workspace nào.</p>
                    <button onClick={openCreateModal}>Tạo cái đầu tiên ngay!</button>
                </div>
            ) : (
                <div className="workspace-list">
                    {workspaces.map((ws) => (
                        <div key={ws.id} className="workspace-container" style={{marginBottom: '40px'}}>
                            <div className="workspace-header-info" style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px'}}>
                                <div className="ws-avatar" style={{
                                    width:'40px', height:'40px', background: ws.background || '#0079bf', 
                                    color:'white', display:'flex', alignItems:'center', justifyContent:'center', 
                                    borderRadius:'4px', fontWeight:'bold', fontSize:'20px'
                                }}>
                                    {ws.name.charAt(0).toUpperCase()}
                                </div>
                                
                                <div style={{flex: 1}}>
                                    <h3 style={{margin:0}}>{ws.name}</h3>
                                    <div style={{fontSize:'12px', color:'#666', display: 'flex', gap: '10px', alignItems: 'center'}}>
                                        <span>{ws.type === 1 ? '🔒 Riêng tư' : '🌍 Công khai'}</span>
                                        {ws.description && <span style={{color: '#888'}}>• {ws.description}</span>}
                                    </div>
                                </div>
                                
                                <div className="ws-actions">
                                    <button onClick={() => openEditModal(ws)} title="Chỉnh sửa thông tin">
                                        <Edit2 size={16}/>
                                    </button>
                                    
                                    <button onClick={() => handleDeleteWorkspace(ws.id)} title="Xóa Workspace" style={{color:'red'}}>
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>

                            <div className="user-board-cards">
                                <BoardCard title="Demo Board 1" color="#0079BF" />
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
            
            {showCreateBoardPopup && (
                <CreateBoardPopup onClose={() => setShowCreateBoardPopup(false)} addNewBoard={() => {}} />
            )}
        </div>
    );
}