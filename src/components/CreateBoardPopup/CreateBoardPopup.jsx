import React, { useState } from "react";
import "./CreateBoardPopup.css";

const VISIBILITY = {
    PRIVATE: 0,
    PUBLIC: 1,
    PROTECTED: 2
};

const CreateBoardPopup = ({ onClose, addNewBoard }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    const [visibility, setVisibility] = useState(VISIBILITY.PRIVATE); 
    const [showViewSelect, setShowViewSelect] = useState(false);
    const [backgroundType, setBackgroundType] = useState("gradient");
    const [selectedBg, setSelectedBg] = useState(null);

    const gradientOptions = [
        "#9abcf2ff, #dff4ffff", "#764ba2, #dbe1ffff", "#dc7e81ff, #ffebe6ff", 
        "#cef930ff, #f5f9deff", "#4e5cdeff, #83f7f7ff", "#28945dff, #e6ffe7ff", 
        "#ef61c2ff, #eddca6ff", "#151239ff, #2330a9ff",
    ];
    const solidColors = [
        "#4BA3C3", "#7B1FA2", "#D32F2F", "#388E3C",
        "#1976D2", "#e5fc51ff", "#ee3dd9ff", "#241f61ff",
    ];
    const imageOptions = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    ];

    const canCreate = title.trim().length > 0;

    const handleCreateBoard = (e) => {
        if (e) e.preventDefault();
        
        addNewBoard({
            title: title,
            background: selectedBg,
            description: description, 
            visibility: visibility 
        });

        setTitle("");
        setDescription("");
        setSelectedBg(null);
        onClose();
    }

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    <h1>Tạo bảng</h1>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div>
                    <p className="label">Phông nền</p>
                    <div className="bg-tabs">
                        <button onClick={() => setBackgroundType("gradient")} className={backgroundType === "gradient" ? "active-tab" : "tab"}>Gradient</button>
                        <button onClick={() => setBackgroundType("image")} className={backgroundType === "image" ? "active-tab" : "tab"}>Ảnh</button>
                        <button onClick={() => setBackgroundType("solid")} className={backgroundType === "solid" ? "active-tab" : "tab"}>Màu đơn</button>
                    </div>

                    <div className="bg-grid">
                        {backgroundType === "gradient" && gradientOptions.map((g, i) => (
                            <div key={i} onClick={() => setSelectedBg(g)} className={selectedBg === g ? "bg-item active-bg" : "bg-item"} style={{ background: `linear-gradient(135deg, ${g})` }} />
                        ))}
                        {backgroundType === "image" && imageOptions.map((img, i) => (
                            <div key={i} onClick={() => setSelectedBg(img)} className={selectedBg === img ? "bg-item bg-img active-bg" : "bg-item bg-img"} style={{ backgroundImage: `url(${img})` }} />
                        ))}
                        {backgroundType === "solid" && solidColors.map((c, i) => (
                            <div key={i} onClick={() => setSelectedBg(c)} className={selectedBg === c ? "bg-item active-bg" : "bg-item"} style={{ background: c }} />
                        ))}
                    </div>
                </div>

                <div className="section-cbp">
                    <p className="label">Tiêu đề bảng *</p>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề"
                        className="title-input"
                    />
                </div>

                <div className="section-cbp">
                    <p className="label">Mô tả</p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả cho bảng..."
                        className="title-input"
                        style={{ 
                            minHeight: '80px', 
                            resize: 'vertical', 
                            fontFamily: 'inherit',
                            paddingTop: '8px'
                        }}
                    />
                </div>

                <div className="section-cbp dropdown-wrapper">
                    <p className="label">Quyền xem</p>
                    <button
                        onClick={() => setShowViewSelect(!showViewSelect)}
                        className="dropdown-btn"
                    >
                        {visibility === VISIBILITY.PRIVATE && "Riêng tư"}
                        {visibility === VISIBILITY.PROTECTED && "Không gian làm việc"}
                        {visibility === VISIBILITY.PUBLIC && "Công khai"}
                    </button>

                    {showViewSelect && (
                        <div className="dropdown-menu">
                            <div onClick={() => { setVisibility(VISIBILITY.PRIVATE); setShowViewSelect(false); }} className="dropdown-item">
                                <p className="item-title">Riêng tư</p>
                                <p className="item-desc">Chỉ thành viên được mời mới có thể xem.</p>
                            </div>
                            <div onClick={() => { setVisibility(VISIBILITY.PROTECTED); setShowViewSelect(false); }} className="dropdown-item">
                                <p className="item-title">Không gian làm việc</p>
                                <p className="item-desc">Tất cả thành viên trong Workspace đều có thể xem.</p>
                            </div>
                            <div onClick={() => { setVisibility(VISIBILITY.PUBLIC); setShowViewSelect(false); }} className="dropdown-item">
                                <p className="item-title">Công khai</p>
                                <p className="item-desc">Bất kỳ ai cũng có thể xem.</p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    disabled={!canCreate}
                    className={canCreate ? "create-btn" : "create-btn disabled"}
                    onClick={handleCreateBoard}
                >
                    Tạo bảng mới
                </button>
            </div>
        </div>
    );
}

export default CreateBoardPopup;