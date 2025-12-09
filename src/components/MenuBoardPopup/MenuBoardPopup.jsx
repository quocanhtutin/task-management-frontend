import React, { useState } from "react";
import "./MenuBoardPopup.css";
import { X, UserPlus, Star, Settings, Image, Share2, Info, ArrowLeft } from "lucide-react";


const MenuBoardPopup = ({ onClose, setShowSharePopup }) => {
    const [backgroundType, setBackgroundType] = useState("gradient");
    const [selectedBg, setSelectedBg] = useState(null);
    const gradientOptions = ["#9abcf2ff, #dff4ffff", "#764ba2, #dbe1ffff", "#dc7e81ff, #ffebe6ff"];
    const solidColors = ["#4BA3C3", "#7B1FA2", "#D32F2F", "#388E3C", "#1976D2"];
    const imageOptions = [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    ];
    const [changeBackground, setChangeBackground] = useState(false)

    return (
        <div className="menu-overlay" onClick={onClose}>

            <div
                className="menu-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {changeBackground &&
                    <div className="change-bg-container">
                        <ArrowLeft size={20} onClick={() => setChangeBackground(false)} />
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
                    </div>}
                <div className="menu-header">
                    <h3>Menu</h3>
                    <X size={28} className="close-btn" onClick={onClose} />
                </div>

                <ul className="menu-list">
                    <li onClick={() => { onClose(); setShowSharePopup(true) }}>
                        <UserPlus size={20} />
                        <span>Chia sẻ</span>
                    </li>

                    <li>
                        <Info size={20} />
                        <span>Về bảng này</span>
                    </li>

                    <li>
                        <Share2 size={20} />
                        <span>In, xuất và chia sẻ</span>
                    </li>

                    <li>
                        <Star size={20} />
                        <span>Gắn sao</span>
                    </li>

                    <li>
                        <Settings size={20} />
                        <span>Cài đặt</span>
                    </li>

                    <li onClick={() => setChangeBackground(true)}>
                        <Image size={20} />
                        <span>Thay đổi hình nền</span>

                    </li>
                </ul>
            </div>
        </div>
    );
};

export default MenuBoardPopup;
