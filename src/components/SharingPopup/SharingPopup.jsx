import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import "./SharingPopup.css";
import { X, Link as LinkIcon } from "lucide-react";
import boardMemberService from "../../services/boardMemberService";
import axiosClient from "../../utils/axiosConfig";
import { StoreContext } from "../../context/StoreContext.jsx";

const SharingPopup = ({ onClose }) => {
  const { boardId } = useParams();
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(0);
  const [creatingLink, setCreatingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  
  const store = useContext(StoreContext) || {};

  useEffect(() => {
    if (!boardId) return;
    
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await boardMemberService.getAllMembers(boardId);
        const data = response.data.value || response.data || [];
        setMembers(data);
      } catch (error) {
        console.error("Lỗi tải thành viên:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [boardId]);

  const getRoleName = (roleId) => {
    return roleId === 1 ? "Quản trị viên" : "Thành viên";
  };

  const _getLocal = (k) => {
    const v = localStorage.getItem(k);
    if (!v) return "";
    const s = String(v).trim();
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "";
    return s;
  };
  const currentEmail = store.email || _getLocal("email") || "";

  const handleCreateLink = async () => {
    if (!boardId) {
      alert("Không xác định board.");
      return;
    }
    setCreatingLink(true);
    try {
      const payload = { 
        Type: 1, 
        TargetId: boardId,
        InvitedUserId: null,
        Slug: null,
        ExpiredAt: null
      };
      
      const res = await axiosClient.post("/InviteLink", payload);
      const data = res.data?.value || res.data || {};
      const token = data.token || data.Token;
      
      if (token) {
        setInviteLink(`${window.location.origin}/invite?token=${token}`);
      } else {
        alert("Tạo thành công nhưng server không trả về Token.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Bạn không có quyền quản lý bảng này.";
      alert(msg);
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Đã sao chép liên kết mời.");
    }
  };

  const handleShareByEmail = async () => {
    if (!inviteEmail.trim() || !boardId) return;
    try {
      await boardMemberService.addMember(boardId, inviteEmail, inviteRole);
      alert("Gửi lời mời thành công.");
      setInviteEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Mời thất bại.");
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-popup" onClick={(e) => e.stopPropagation()}>
        
        <div className="share-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Chia sẻ bảng</h3>
          <button className="share-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="share-invite">
          <input 
            placeholder="Địa chỉ email hoặc tên" 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(Number(e.target.value))}>
            <option value={0}>Thành viên</option>
            <option value={1}>Quản trị viên</option>
          </select>
          <button className="share-submit-btn" onClick={handleShareByEmail}>Chia sẻ</button>
        </div>

        <div className="share-link-section" style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
          <div className="share-link-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={20} />
              <span>Chia sẻ bằng liên kết</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="share-create-link-btn" 
                onClick={handleCreateLink} 
                disabled={creatingLink}
              >
                {creatingLink ? 'Đang tạo...' : inviteLink ? 'Tạo lại' : 'Tạo liên kết'}
              </button>
              {inviteLink && (
                <button 
                  className="share-copy-btn" 
                  onClick={handleCopyLink}
                  style={{ backgroundColor: '#5aac44', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Sao chép
                </button>
              )}
            </div>
          </div>
          {inviteLink && (
            <input 
              readOnly 
              value={inviteLink} 
              style={{ width: '100%', marginTop: 10, padding: '6px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f4f5f7' }} 
            />
          )}
        </div>

        <div className="share-tabs" style={{ marginTop: '20px', borderBottom: '1px solid #ddd' }}>
          <button className={`tab-list ${tab === "members" ? "tab-active" : ""}`} onClick={() => setTab("members")}>
            Thành viên ({members.length})
          </button>
          <button className={`tab-list ${tab === "requests" ? "tab-active" : ""}`} onClick={() => setTab("requests")}>
            Yêu cầu tham gia
          </button>
        </div>

        {/* Section: List (Lấy từ nhánh merge - để hỗ trợ Avatar và Date) */}
        <div className="share-body" style={{ marginTop: '15px', maxHeight: '300px', overflowY: 'auto' }}>
          {tab === "members" ? (
            <div className="member-list">
              {loading && <div style={{textAlign: 'center', padding: '10px'}}>Đang tải...</div>}
              
              {!loading && members.map((member) => (
                <div className="member-item" key={member.userId || member.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {/* Avatar section từ merge */}
                  <div className="member-avatar" style={{ overflow: 'hidden', background: '#e0e0e0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    {member.avatarUrl ? (
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {e.target.style.display = 'none'}}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                      </span>
                    )}
                  </div>
                  
                  {/* Info section từ merge */}
                  <div className="member-info" style={{ flex: 1 }}>
                    <p className="member-name" style={{ margin: 0, fontWeight: 500 }}>
                      {member.name} 
                      {currentEmail && member.email === currentEmail ? " (bạn)" : ""}
                    </p>
                    <p className="member-username" style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                      {/* Hiển thị ngày tham gia nếu có, fallback về email */}
                      {member.joinedAt 
                        ? `Tham gia: ${new Date(member.joinedAt).toLocaleDateString('vi-VN')}` 
                        : member.email}
                    </p>
                  </div>

                  {/* Role section */}
                  <select 
                    className="member-role" 
                    defaultValue={getRoleName(member.role)}
                  >
                    <option>Quản trị viên</option>
                    <option>Thành viên</option>
                  </select>
                </div>
              ))}
              
              {!loading && members.length === 0 && (
                <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>Chưa có thành viên nào.</div>
              )}
            </div>
          ) : (
            <div className="member-requests">
              Không có yêu cầu nào
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SharingPopup;