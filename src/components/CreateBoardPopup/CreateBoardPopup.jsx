import React, { useEffect, useState } from "react";
import "./CreateBoardPopup.css";

const CreateBoardPopup = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [viewType, setViewType] = useState("workspace");
    const [showViewSelect, setShowViewSelect] = useState(false);

    const [backgroundType, setBackgroundType] = useState("gradient");
    const [selectedBg, setSelectedBg] = useState(null);

    const canCreate = title.trim().length > 0;

    const gradientOptions = ["#a1c4fd,#c2e9fb", "#667eea,#764ba2", "#ff9a9e,#fad0c4"];
    const solidColors = ["#4BA3C3", "#7B1FA2", "#D32F2F", "#388E3C", "#1976D2"];
    const imageOptions = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    ];

    useEffect(() => {
        console.log(selectedBg)
    }, [selectedBg])

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    <h1>Tạo bảng</h1>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                {/* Background section-cbp */}
                <div>
                    <p className="label">Phông nền</p>

                    <div className="bg-tabs">
                        <button
                            onClick={() => setBackgroundType("gradient")}
                            className={backgroundType === "gradient" ? "active-tab" : "tab"}
                        >
                            Gradient
                        </button>
                        <button
                            onClick={() => setBackgroundType("image")}
                            className={backgroundType === "image" ? "active-tab" : "tab"}
                        >
                            Ảnh
                        </button>
                        <button
                            onClick={() => setBackgroundType("solid")}
                            className={backgroundType === "solid" ? "active-tab" : "tab"}
                        >
                            Màu đơn
                        </button>
                    </div>

                    {/* Background Options */}
                    <div className="bg-grid">
                        {backgroundType === "gradient" &&
                            gradientOptions.map((g, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedBg(g)}
                                    className={selectedBg === g ? "bg-item active-bg" : "bg-item"}
                                    style={{ background: `linear-gradient(135deg, ${g})` }}
                                />
                            ))}

                        {backgroundType === "image" &&
                            imageOptions.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedBg(img)}
                                    className={selectedBg === img ? "bg-item bg-img active-bg" : "bg-item bg-img"}
                                    style={{ backgroundImage: `url(${img})` }}
                                />
                            ))}

                        {backgroundType === "solid" &&
                            solidColors.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedBg(c)}
                                    className={selectedBg === c ? "bg-item active-bg" : "bg-item"}
                                    style={{ background: c }}
                                />
                            ))}
                    </div>
                </div>

                {/* Title Input */}
                <div className="section-cbp">
                    <p className="label">Tiêu đề bảng *</p>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề"
                        className="title-input"
                    />
                </div>

                {/* View Type Dropdown */}
                <div className="section-cbp dropdown-wrapper">
                    <p className="label">Quyền xem</p>
                    <button
                        onClick={() => setShowViewSelect(!showViewSelect)}
                        className="dropdown-btn"
                    >
                        {viewType === "private" && "Riêng tư"}
                        {viewType === "workspace" && "Không gian làm việc"}
                        {viewType === "public" && "Công khai"}
                    </button>

                    {showViewSelect && (
                        <div className="dropdown-menu">
                            <div
                                onClick={() => {
                                    setViewType("private");
                                    setShowViewSelect(false);
                                }}
                                className="dropdown-item"
                            >
                                <p className="item-title">Riêng tư</p>
                                <p className="item-desc">Tất cả thành viên có thể xem. Quản trị viên có thể đóng hoặc xóa thành viên</p>
                            </div>

                            <div
                                onClick={() => {
                                    setViewType("workspace");
                                    setShowViewSelect(false);
                                }}
                                className="dropdown-item"
                            >
                                <p className="item-title">Không gian làm việc</p>
                                <p className="item-desc">Tất cả thành viên có thể xem và sửa</p>
                            </div>

                            <div
                                onClick={() => {
                                    setViewType("public");
                                    setShowViewSelect(false);
                                }}
                                className="dropdown-item"
                            >
                                <p className="item-title">Công khai</p>
                                <p className="item-desc">Tất cả mọi người đều có thể xem. Chỉ thành viên mới có thể sửa</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Button */}
                <button
                    disabled={!canCreate}
                    className={canCreate ? "create-btn" : "create-btn disabled"}
                >
                    Tạo bảng mới
                </button>
            </div>
        </div>
    );
}

export default CreateBoardPopup