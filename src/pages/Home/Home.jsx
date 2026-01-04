import React from 'react';
import BoardsPage from '../BoardsPage/BoardsPage.jsx'; // Kiểm tra kỹ đường dẫn file của bạn

const Home = () => {
    return (
        <div className="home-wrapper" style={{ padding: '20px' }}>
            <div className="home-welcome-section" style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#172b4d', fontSize: '24px' }}>Chào mừng quay trở lại!</h1>
                <p style={{ color: '#44546f' }}>Chọn một không gian làm việc để bắt đầu nhiệm vụ của bạn.</p>
            </div>
            
            {/* Component BoardsPage sẽ hiển thị danh sách Workspace và Starred Boards */}
            <BoardsPage /> 
        </div>
    );
};

export default Home;