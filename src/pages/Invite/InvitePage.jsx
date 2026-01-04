import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import './InvitePage.css';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!token) return;
    setIsJoining(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axios.post('/InviteLink/Join', { token }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const data = res.data?.value || res.data;
      
      if (data?.boardId) {
        navigate(`/board/${data.boardId}`, { replace: true });
      } else {
        alert("Bạn đã tham gia thành công!");
        navigate('/home', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Link hết hạn hoặc bạn đã là thành viên.";
      alert(msg);
      navigate('/home', { replace: true });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="invite-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="invite-card" style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h2>Xác nhận lời mời</h2>
        <p style={{ margin: '20px 0', color: '#666' }}>
          Bạn nhận được lời mời tham gia vào không gian làm việc hoặc bảng công việc.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={handleJoin} 
            disabled={isJoining} 
            style={{ padding: '12px', cursor: 'pointer', background: '#0052cc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            {isJoining ? 'Đang xử lý...' : 'Chấp nhận tham gia'}
          </button>
          <button 
            onClick={() => navigate('/home')} 
            disabled={isJoining} 
            style={{ padding: '12px', cursor: 'pointer', border: '1px solid #ddd', background: 'none', borderRadius: '5px' }}
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;