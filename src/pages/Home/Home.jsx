import React from 'react';
import BoardsPage from '../BoardsPage/BoardsPage.jsx';

const Home = () => {
    return (
        <div className="home-wrapper" >
            {/* <div className="home-welcome-section" style={{ paddingLeft: '24px', paddingTop: '24px' }}>
                <h1 style={{ color: '#172b4d', fontSize: '24px' }}>Chào mừng quay trở lại!</h1>
                <p style={{ color: '#44546f' }}>Chọn một không gian làm việc để bắt đầu nhiệm vụ của bạn.</p>
            </div> */}

            <BoardsPage />
        </div>
    );
};

export default Home;