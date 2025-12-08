import React, { useState } from "react";
import "./SharingPopup.css";
import { X } from "lucide-react";

const SharingPopup = ({ onClose }) => {
    const [tab, setTab] = useState("members")
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
                        <option>Thành viên</option>
                        <option>Quản trị viên</option>
                    </select>
                    <button className="share-submit-btn">Chia sẻ</button>
                </div>

                <div className="share-link-section">
                    <div className="share-link-row">
                        <span>🔗 Chia sẻ bảng này bằng liên kết</span>
                        <button className="share-create-link-btn">Tạo liên kết</button>
                    </div>
                </div>

                <div className="share-tabs">
                    <button className={`tab-list ${tab === "members" ? "tab-active" : ""}`} onClick={() => setTab("members")}>Thành viên của bảng</button>
                    <button className={`tab-list ${tab === "requests" ? "tab-active" : ""}`} onClick={() => setTab("requests")}>Yêu cầu tham gia</button>
                </div>
                {tab === "members" ?
                    <div className="member-list">
                        <div className="member-item">
                            <div className="member-avatar">QN</div>
                            <div className="member-info">
                                <p className="member-name">Quốc Anh Nguyễn (bạn)</p>
                                <p className="member-username">@qucanhnguyen26</p>
                            </div>
                            <select className="member-role">
                                <option>Quản trị viên</option>
                                <option>Thành viên</option>
                            </select>
                        </div>
                    </div>
                    :
                    <div className="member-requests">
                        Không có yêu cầu nào
                    </div>
                }

            </div>
        </div>
    );
};

export default SharingPopup;
