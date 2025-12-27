import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardCard from '../BoardCard/BoardCard.jsx';
import boardService from '../../services/boardService';

const WorkspaceBoardList = ({ workspaceId, onOpenCreateBoard, refreshTrigger }) => {
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, [workspaceId, refreshTrigger]);

    const fetchBoards = async () => {
        try {
            const res = await boardService.getBoards(workspaceId);
            const data = res.data && res.data.value ? res.data.value : [];
            setBoards(data);
        } catch (error) {
            console.error(`Lỗi tải board cho workspace ${workspaceId}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div style={{fontSize: '14px', color: '#888'}}>Đang tải bảng...</div>;

    return (
        <div className="user-board-cards">
            {boards.map(board => (
                <BoardCard 
                    key={board.id} 
                    title={board.title} 
                    color={board.background || '#0079BF'}
                    onClick={() => navigate(`/board/${board.id}`)}
                />
            ))}

            <BoardCard 
                title="Tạo bảng mới" 
                add 
                color="#E2E4E6" 
                onClick={() => onOpenCreateBoard(workspaceId)}
            />
        </div>
    );
};

export default WorkspaceBoardList;