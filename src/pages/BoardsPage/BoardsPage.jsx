import React, { useState } from 'react';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import { useNavigate } from 'react-router-dom';
import './BoardsPage.css';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';

export default function BoardsPage() {
    const templates = [
        { title: 'Manage project', color: '#0079BF' },
        { title: 'Scrum', color: '#00C2E0' },
        { title: 'Errors track', color: '#61BD4F' },
        { title: 'Web process', color: '#F5DD29' },
    ];

    const [showCreateBoardPopup, setShowCreateBoardPopup] = useState(false)

    const navigate = useNavigate()

    return (
        <div className="boards-page">
            {showCreateBoardPopup && <CreateBoardPopup onClose={() => setShowCreateBoardPopup(false)} />}
            <WorkspaceHeader />
            <div className="templates-section">
                <h3>Jira</h3>
                <p>Bắt đầu với một mẫu và để Jira xử lý quy trình làm việc của bạn.</p>
                <div className="template-cards">
                    {templates.map((t, i) => (
                        <BoardCard key={i} title={t.title} color={t.color} />
                    ))}
                </div>
            </div>

            <div className="user-boards">
                <h3>Các bảng của bạn</h3>
                <div className="user-board-cards">
                    <BoardCard title="My board" color="#89609E" />
                    <BoardCard title="Create board" add color="#E2E4E6" showPopup={() => setShowCreateBoardPopup(true)} />
                </div>
            </div>
        </div>
    );
}
