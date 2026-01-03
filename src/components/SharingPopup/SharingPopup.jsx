import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./SharingPopup.css";
import { X, Link } from "lucide-react";
import boardMemberService from "../../services/boardMemberService";

const SharingPopup = ({ onClose }) => {
    const { boardId } = useParams();
    const [tab, setTab] = useState("members");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

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
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [boardId]);

    const getRoleName = (roleId) => {
        return roleId === 1 ? "Quản trị viên" : "Thành viên";
    };

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
                    <input placeholder="Địa chỉ email hoặc tên" />
                    <select>
                        <option value="2">Thành viên</option>
                        <option value="1">Quản trị viên</option>
                    </select>
                    <button className="share-submit-btn">Chia sẻ</button>
                </div>

                <div className="share-link-section">
                    <div className="share-link-row">
                        <Link size={20} />
                        <span> Chia sẻ bảng này bằng liên kết</span>
                        <button className="share-create-link-btn">Tạo liên kết</button>
                    </div>
                </div>

                <div className="share-tabs">
                    <button className={`tab-list ${tab === "members" ? "tab-active" : ""}`} onClick={() => setTab("members")}>Thành viên của bảng ({members.length})</button>
                    <button className={`tab-list ${tab === "requests" ? "tab-active" : ""}`} onClick={() => setTab("requests")}>Yêu cầu tham gia</button>
                </div>

                {tab === "members" ? (
                    <div className="member-list">
                        {loading && <div style={{textAlign: 'center', padding: '10px'}}>Đang tải...</div>}
                        
                        {!loading && members.map((member) => (
                            <div className="member-item" key={member.userId}>
                                <div className="member-avatar" style={{ overflow: 'hidden', background: '#e0e0e0' }}>
                                    {member.avatarUrl ? (
                                        <img 
                                            src={member.avatarUrl} 
                                            alt={member.name} 
                                            onError={(e) => {e.target.style.display = 'none'}}
                                        />
                                    ) : (
                                        <span>{member.name ? member.name.charAt(0).toUpperCase() : "?"}</span>
                                    )}
                                </div>
                                
                                <div className="member-info">
                                    <p className="member-name">{member.name}</p>
                                    <p className="member-username" style={{fontSize: '12px', color: '#888'}}>
                                        Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
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
    );
};

export default SharingPopup;