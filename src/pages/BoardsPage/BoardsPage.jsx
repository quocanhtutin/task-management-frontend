
import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext.jsx';
import { useNavigate } from 'react-router-dom';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';
import CreateWorkspaceModal from '../../components/CreateWorkspaceModal/CreateWorkspaceModal.jsx';
import WorkspaceMembersModal from '../../components/WorkspaceMembersModal/WorkspaceMembersModal.jsx';
import WorkspaceBoardList from '../../components/WorkspaceBoardList/WorkspaceBoardList.jsx';
import workspaceService from '../../services/workspaceService';
import boardService from '../../services/boardService';
import './BoardsPage.css';
import { Trash2, Edit2, Users, Briefcase, Star } from 'lucide-react';
import { WORKSPACE_TYPES } from '../../components/CreateWorkspaceModal/CreateWorkspaceModal.jsx';

export default function BoardsPage() {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [starredBoards, setStarredBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const [showCreateBoardPopup, setShowCreateBoardPopup] = useState(false);
    const [activeWorkspaceIdForBoard, setActiveWorkspaceIdForBoard] = useState(null);

    const { accessToken } = useContext(StoreContext);

    useEffect(() => {
        if (!accessToken) return;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const wsRes = await workspaceService.getAll();
                const workspacesData = wsRes.data.value || wsRes.data || [];
                setWorkspaces(workspacesData);

                if (Array.isArray(workspacesData) && workspacesData.length > 0) {
                    const pinnedPromises = workspacesData.map(ws =>
                        boardService.getBoards(ws.id || ws.Id, { pinned: true })
                    );

                    const responses = await Promise.all(pinnedPromises);
                    const allPinnedBoards = responses.flatMap(res => {
                        const bData = res.data.value || res.data || [];
                        return Array.isArray(bData) ? bData : [];
                    });

                    const uniquePinned = allPinnedBoards.filter(b => b.pinned);

                    setStarredBoards(uniquePinned);
                } else {
                    setStarredBoards([]);
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [accessToken, refreshTrigger]);

    const openCreateModal = () => { setSelectedWorkspace(null); setShowCreateWorkspace(true); };
    const openEditModal = (ws) => { setSelectedWorkspace(ws); setShowCreateWorkspace(true); };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedWorkspace) {
                const wsId = selectedWorkspace.id || selectedWorkspace.Id;
                if (!wsId) return;
                const tasks = [];
                if (formData.name !== selectedWorkspace.name) tasks.push(() => workspaceService.updateName(wsId, formData.name));
                const oldDesc = selectedWorkspace.description || '';
                const newDesc = formData.description || '';
                if (newDesc !== oldDesc) tasks.push(() => workspaceService.updateDescription(wsId, newDesc));
                if (Number(formData.type) !== Number(selectedWorkspace.type)) tasks.push(() => workspaceService.updateType(wsId, formData.type));
                if (formData.background !== selectedWorkspace.background) tasks.push(() => workspaceService.updateBackground(wsId, formData.background));

                if (tasks.length === 0) { setShowCreateWorkspace(false); return; }
                for (const task of tasks) { await task(); await delay(500); }
                alert("Cập nhật thành công!");
            } else {
                await workspaceService.create(formData);
                alert("Tạo mới thành công!");
            }
            setShowCreateWorkspace(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { console.error(error); alert("Lỗi xảy ra!"); }
    };

    const handleDeleteWorkspace = async (id) => {
        if (window.confirm("Xóa Workspace này?")) {
            try {
                await workspaceService.delete(id);
                setRefreshTrigger(prev => prev + 1);
            } catch (error) { alert("Xóa thất bại."); }
        }
    };

    const handleOpenCreateBoard = (workspaceId) => {
        setActiveWorkspaceIdForBoard(workspaceId);
        setShowCreateBoardPopup(true);
    };

    const handleCreateBoard = async (boardData) => {
        if (!activeWorkspaceIdForBoard) return;

        try {
            const payload = {
                board: {
                    workspaceId: activeWorkspaceIdForBoard,
                    title: boardData.title,
                    description: boardData.description || '',
                    background: boardData.background || '#0079bf',
                    visibility: (boardData.visibility !== undefined) ? boardData.visibility : 0
                }
            };

            await boardService.create(payload);

            setShowCreateBoardPopup(false);
            setActiveWorkspaceIdForBoard(null);

            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error("Lỗi tạo board:", error);
            alert("Không thể tạo bảng mới.");
        }
    };

    const getBoardStyle = (bg) => {
        if (!bg) return { background: '#0079bf' };
        if (bg.startsWith('http')) {
            return {
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        if (bg.includes(',')) {
            return { background: `linear-gradient(135deg, ${bg})` };
        }
        return { background: bg };
    };

    if (isLoading) return <div className="loading-container">Đang tải dữ liệu...</div>;

    return (
        <div className="boards-page">
            <div className="bp-header">
                <h2>Các không gian làm việc của bạn</h2>
                <p className="btn-create-ws" onClick={openCreateModal}>+ Tạo Workspace Mới</p>
            </div>

            {starredBoards.length > 0 && (
                <div className="starred-boards-section" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#172b4d' }}>
                        <Star size={24} fill="#e6c60d" color="#e6c60d" />
                        <h3 style={{ margin: 0, fontWeight: '700', fontSize: '18px' }}>Các bảng đã gắn sao</h3>
                    </div>

                    <div className="board-list-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px'
                    }}>
                        {starredBoards.map(board => (
                            <div
                                key={board.id}
                                className="board-card-item"
                                onClick={() => navigate(`/board/${board.id}`)}
                                style={{
                                    ...getBoardStyle(board.background),
                                    height: '100px',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    position: 'relative',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.1s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                            >
                                <span style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {board.title}
                                </span>

                                <div style={{ alignSelf: 'flex-end' }}>
                                    <Star size={18} fill="#e6c60d" color="#e6c60d" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {workspaces.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa có Workspace nào.</p>
                </div>
            ) : (
                <div className="workspace-list">
                    {workspaces.map((ws) => (
                        <div key={ws.id || ws.Id} className="workspace-container" style={{ marginBottom: '40px' }}>
                            <div className="workspace-header-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div className="ws-avatar" style={{
                                    width: '46px', height: '46px', background: ws.background || '#0079bf',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '8px', fontWeight: 'bold', fontSize: '20px'
                                }}>
                                    {(ws.name || 'W').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{ws.name}</h3>
                                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eee', padding: '1px 5px', borderRadius: '4px' }}>
                                            <Briefcase size={12} /> {WORKSPACE_TYPES[ws.type] || 'Khác'}
                                        </span>
                                        {ws.description &&
                                            <p style={{ color: '#666', whiteSpace: "pre-wrap" }}>
                                                • {ws.description}
                                            </p>}
                                    </div>
                                </div>
                                <div className="ws-actions">
                                    <Edit2 size={20} onClick={() => openEditModal(ws)} />
                                    <Users size={20} onClick={() => { setSelectedWorkspace(ws); setShowMembersModal(true); }} />
                                    <Trash2 size={20} onClick={() => handleDeleteWorkspace(ws.id || ws.Id)} style={{ color: 'red' }} />
                                </div>
                            </div>

                            <WorkspaceBoardList
                                workspaceId={ws.id || ws.Id}
                                onOpenCreateBoard={handleOpenCreateBoard}
                                refreshTrigger={refreshTrigger}
                            />

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
                <WorkspaceMembersModal workspace={selectedWorkspace} onClose={() => setShowMembersModal(false)} />
            )}

            {showCreateBoardPopup && (
                <CreateBoardPopup
                    onClose={() => setShowCreateBoardPopup(false)}
                    addNewBoard={handleCreateBoard}
                />
            )}
        </div>
    );
}