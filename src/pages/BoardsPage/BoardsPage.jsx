import React from 'react';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import { useNavigate } from 'react-router-dom';
import './BoardsPage.css';

export default function BoardsPage() {
    const templates = [
        { title: 'Quản lý Dự án', color: '#0079BF' },
        { title: 'Scrum', color: '#00C2E0' },
        { title: 'Theo dõi Lỗi', color: '#61BD4F' },
        { title: 'Quy trình Thiết kế Web', color: '#F5DD29' },
    ];

    const navigate = useNavigate()

    return (
        <div className="boards-page">
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
                    <BoardCard title="Bảng của tôi" color="#89609E" />
                    <BoardCard title="Tạo bảng mới" color="#E2E4E6" add />
                </div>
            </div>
        </div>
    );
}
