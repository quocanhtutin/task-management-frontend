import React, { useState, useEffect, useContext } from "react";
import "./MoveListPopup.css";
import { X, ArrowRight } from "lucide-react";
import boardService from "../../services/boardService";
import listService from "../../services/listService";
import { StoreContext } from "../../context/StoreContext";

const MoveListPopup = ({ onClose, listId, currentBoardId, onMoveSuccess, workspaceId }) => {
    const { currentWorkSpace } = useContext(StoreContext);

    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchBoards = async () => {
            setFetching(true);
            
            const targetWorkspaceId = workspaceId || currentWorkSpace?.id;

            console.log("Fetching boards for Workspace ID:", targetWorkspaceId);

            if (!targetWorkspaceId) {
                console.warn("Không tìm thấy Workspace ID, không thể tải danh sách bảng.");
                setFetching(false);
                return; 
            }

            try {
                const res = await boardService.getBoards(targetWorkspaceId);
                const allBoards = res.data.value || res.data; 
                const otherBoards = allBoards.filter(b => b.id !== currentBoardId);
                setBoards(otherBoards);
                
                if (otherBoards.length > 0) {
                    setSelectedBoardId(otherBoards[0].id);
                }
            } catch (error) {
                console.error("Lỗi tải danh sách board:", error);
            } finally {
                setFetching(false);
            }
        };

        fetchBoards();
    }, [currentBoardId, workspaceId, currentWorkSpace]); 

    const handleMove = async () => {
        if (!selectedBoardId) return;
        setLoading(true);
        try {
            await listService.move(listId, selectedBoardId);
            onMoveSuccess(listId); 
            onClose();
        } catch (error) {
            console.error("Lỗi di chuyển list:", error);
            const msg = error.response?.data?.message || "Không thể di chuyển danh sách.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="move-popup-overlay" onClick={onClose}>
            <div className="move-popup-container" onClick={(e) => e.stopPropagation()}>
                
                <div className="move-popup-header">
                    <h3>Di chuyển danh sách</h3>
                    <button className="move-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="move-popup-body">
                    <p style={{ fontSize: '14px', color: '#5e6c84', margin: 0 }}>
                        Chọn bảng đích để di chuyển danh sách này tới.
                    </p>
                    
                    <div>
                        <label className="move-label">Bảng đích</label>
                        {fetching ? (
                            <div className="move-select" style={{ color: '#888' }}>Đang tải...</div>
                        ) : (
                            <select 
                                className="move-select"
                                value={selectedBoardId}
                                onChange={(e) => setSelectedBoardId(e.target.value)}
                                disabled={boards.length === 0}
                            >
                                {boards.length === 0 ? (
                                    <option value="">Không tìm thấy bảng nào khác</option>
                                ) : (
                                    boards.map(b => (
                                        <option key={b.id} value={b.id}>{b.title}</option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>

                    <div className="move-actions">
                        <button className="move-btn cancel" onClick={onClose}>
                            Hủy
                        </button>
                        <button 
                            className="move-btn primary" 
                            onClick={handleMove}
                            disabled={loading || boards.length === 0 || fetching}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {loading ? "Đang xử lý..." : (
                                <>
                                    Di chuyển <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MoveListPopup;