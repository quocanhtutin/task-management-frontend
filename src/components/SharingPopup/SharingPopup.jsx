import React, { useState, useEffect, useContext } from "react";
import "./SharingPopup.css";
import { X, Link as LinkIcon } from "lucide-react";
import boardMemberService from "../../services/boardMemberService";
import axiosClient from "../../utils/axiosConfig";
import { StoreContext } from "../../context/StoreContext.jsx";
import { useParams } from "react-router-dom";

const SharingPopup = ({ onClose }) => {
  const [tab, setTab] = useState("members");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(0);
  const [creatingLink, setCreatingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const store = useContext(StoreContext) || {};
  const { boardId: paramBoardId } = useParams();
  const boardId = paramBoardId || "";

  const _getLocal = (k) => {
    const v = localStorage.getItem(k);
    if (!v) return "";
    const s = String(v).trim();
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "";
    return s;
  };

  useEffect(() => {
    if (!boardId) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    boardMemberService.getAllMembers(boardId)
      .then(res => {
        const data = res.data?.value || res.data || [];
        const normalized = data.map(m => {
          const user = m.user || {};
          const email = (m.email || user.email || "").toString();
          const name = (m.name || user.name || "Người dùng").toString();
          const userId = m.userId ?? m.id ?? user.id ?? "";
          let role = m.role ?? 0;
          return { userId, name, email, role };
        });
        setMembers(normalized);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [boardId]);

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

  const currentEmail = store.email || _getLocal("email") || "";

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-popup" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>Chia sẻ bảng</h3>
          <button className="share-close-btn" onClick={onClose}>
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

        <div className="share-link-section">
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

        <div className="share-tabs">
          <button className={`tab-list ${tab === "members" ? "tab-active" : ""}`} onClick={() => setTab("members")}>Thành viên</button>
          <button className={`tab-list ${tab === "requests" ? "tab-active" : ""}`} onClick={() => setTab("requests")}>Yêu cầu</button>
        </div>

        {tab === "members" ? (
          <div className="member-list">
            {loadingMembers ? (
              <div style={{ padding: 12 }}>Đang tải...</div>
            ) : (
              members.map(m => {
                const isCurrent = currentEmail && m.email && currentEmail.toLowerCase() === m.email.toLowerCase();
                return (
                  <div className="member-item" key={m.userId || m.email}>
                    <div className="member-avatar">{(m.name[0] || 'U').toUpperCase()}</div>
                    <div className="member-info">
                      <p className="member-name">{m.name}{isCurrent ? ' (bạn)' : ''}</p>
                      <p className="member-username">{m.email}</p>
                    </div>
                    <select className="member-role" defaultValue={m.role} disabled>
                      <option value={2}>Chủ sở hữu</option>
                      <option value={1}>Quản trị viên</option>
                      <option value={0}>Thành viên</option>
                    </select>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="member-requests">Không có yêu cầu nào</div>
        )}
      </div>
    </div>
  );
};

export default SharingPopup;