import React, { useState } from "react";
import "./MenuBoardPopup.css";
import { X, UserPlus, Settings, Image, Share2, Info, ArrowLeft, UserRound, Archive, Trash2, ArchiveX, Tags, Edit, XCircle } from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";


const MenuBoardPopup = ({
    onClose,
    setShowSharePopup,
    setRawColor,
    rawColor,
    isStarred,
    setIsStarred,
    boardDes,
    setBoardDes,
    storedCards,
    setShowCardDetailPopup,
    setCardDetail,
    activateCard,
    storedColumns,
    activateColumn,
    labels,
    addLabel,
    deleteLabel,
    updateLabel
}) => {
    const [backgroundType, setBackgroundType] = useState("gradient");
    const gradientOptions = [
        "#9abcf2ff, #dff4ffff",
        "#764ba2, #dbe1ffff",
        "#dc7e81ff, #ffebe6ff",
        "#cef930ff, #f5f9deff",
        "#4e5cdeff, #83f7f7ff",
        "#28945dff, #e6ffe7ff",
        "#ef61c2ff, #eddca6ff",
        "#151239ff, #2330a9ff",
    ];
    const solidColors = [
        "#4BA3C3",
        "#7B1FA2",
        "#D32F2F",
        "#388E3C",
        "#1976D2",
        "#e5fc51ff",
        "#ee3dd9ff",
        "#241f61ff",
    ];
    const LABEL_COLORS = [
        "#BAF3DB", "#F8E6A0", "#FFE2A8", "#FFD5D2", "#EBD9FF",
        "#4BCE97", "#E2B203", "#FF9F1A", "#FF7452", "#C77DFF",
        "#1F845A", "#946F00", "#C25100", "#C9372C", "#8F46C1",
        "#D6E4FF", "#C6EDFB", "#D3F1A7", "#FDD0EC", "#DFE1E6",
        "#6B9EFF", "#6CC3E0", "#94C748", "#E774BB", "#8C8F97",
        "#1D6CE0", "#227D9B", "#5B7F24", "#A64D79", "#6B6E76"
    ]
    const imageOptions = [];
    const [changeBackground, setChangeBackground] = useState(false)
    const [showInfo, setShowInfo] = useState(false)

    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [desc, setDesc] = useState(boardDes)

    const [showStore, setShowStore] = useState(false)
    const [storedCategory, setStoredCategory] = useState("card")

    const [showLabel, setShowLabel] = useState(false)
    const [showAddLabel, setShowAddLabel] = useState(false)
    const [newLabelColor, setNewLabelColor] = useState("")
    const [newLabelTitle, setNewLabelTitle] = useState("")

    return (
        <div className="menu-overlay" onClick={onClose}>
            <div
                className="menu-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {changeBackground &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Phông nền</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setChangeBackground(false)} />
                        </div>

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

                        <div className="bg-grid-menu">
                            {backgroundType === "gradient" &&
                                gradientOptions.map((g, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setRawColor(g)}
                                        className={rawColor === g ? "bg-item-menu active-bg" : "bg-item-menu"}
                                        style={{ background: `linear-gradient(135deg, ${g})` }}
                                    />
                                ))}

                            {backgroundType === "image" &&
                                imageOptions.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setRawColor(img)}
                                        className={rawColor === img ? "bg-item-menu bg-img active-bg" : "bg-item-menu bg-img"}
                                        style={{ backgroundImage: `url(${img})` }}
                                    />
                                ))}

                            {backgroundType === "solid" &&
                                solidColors.map((c, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setRawColor(c)}
                                        className={rawColor === c ? "bg-item-menu active-bg" : "bg-item-menu"}
                                        style={{ background: c }}
                                    />
                                ))}
                        </div>
                    </div>
                }

                {showStore &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Kho lưu trữ</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setShowStore(false)} />
                        </div>

                        <div className="store-cat">
                            <button
                                onClick={() => setStoredCategory("card")}
                                className={storedCategory === "card" ? "active-tab" : "tab"}
                            >
                                Thẻ nhiệm vụ
                            </button>
                            <button
                                onClick={() => setStoredCategory("list")}
                                className={storedCategory === "list" ? "active-tab" : "tab"}
                            >
                                Danh sách
                            </button>
                        </div>

                        <div className="store">
                            {storedCategory === "card" &&
                                storedCards.map((card, i) =>
                                    <div
                                        key={i}
                                        className="stored-card-item"
                                        style={card.label ? { backgroundColor: card.label, color: "white" } : { background: "white" }}
                                    >
                                        <input type="checkbox" checked={card.check} />
                                        <p onClick={() => { setCardDetail(card), setShowCardDetailPopup(true), onClose() }}>{card.title}</p>
                                        <ArchiveX className="activate-btn" size={20} onClick={() => activateCard(i)} />
                                        <Trash2 className="delete-btn" size={20} />
                                    </div>
                                )
                            }
                            {storedCategory === "list" &&
                                storedColumns.map((col, i) =>
                                    <div
                                        key={i}
                                        className="stored-column-item"
                                    >
                                        <p >{col.title}</p>
                                        <ArchiveX className="activate-btn" size={20} onClick={() => activateColumn(i)} />
                                        <Trash2 className="delete-btn" size={20} />
                                    </div>
                                )
                            }
                        </div>
                    </div>
                }

                {showInfo &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Thông tin</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setShowInfo(false)} />
                        </div>
                        <div className="owner">
                            <div className="owner-section">
                                <UserRound size={28} />
                                <h2>Quản trị viên của bảng</h2>
                            </div>
                            <div className="member-item">
                                <div className="member-avatar">QA</div>
                                <div className="member-info">
                                    <p className="member-name">Quốc Anh Nguyễn (bạn)</p>
                                    <p className="member-username">@qucanhnguyen26</p>
                                </div>
                            </div>
                        </div>
                        <div className="board-info">
                            <h2>Mô tả</h2>
                            <AutoResizeTextarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                onFocus={() => setIsEditingDesc(true)}
                            />

                            {isEditingDesc && (
                                <div className="desc-actions">
                                    <button onClick={() => { setDesc(boardDes || ""); setIsEditingDesc(false) }} className="btn">Hủy</button>
                                    <button onClick={() => { setBoardDes(desc); setIsEditingDesc(false) }} className="btn primary">Lưu</button>
                                </div>
                            )}
                        </div>
                    </div>
                }

                {showLabel &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Nhãn đánh dấu</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setShowLabel(false)} />
                        </div>
                        <div className="add-label">
                            <button className="add-label-btn" onClick={() => setShowAddLabel(true)}>Thêm nhãn</button>
                            {showAddLabel &&
                                <div className="add-label-popup">
                                    <input value={newLabelTitle} onChange={(e) => setNewLabelTitle(e.target.value)} />
                                    <div className="new-label-grid">
                                        {LABEL_COLORS.map((color, i) => (
                                            <div
                                                key={i}
                                                className={`new-label-item ${newLabelColor === color ? "active" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setNewLabelColor(color)} />
                                        ))}
                                    </div>
                                    <div>
                                        <button className="add-card blue" onClick={() => {
                                            addLabel(newLabelColor, newLabelTitle)
                                            setShowAddLabel(false)
                                            setNewLabelColor("")
                                            setNewLabelTitle("")
                                        }}>Lưu</button>
                                        <button className="add-card white" onClick={() => {
                                            setShowAddLabel(false)
                                            setNewLabelColor("")
                                            setNewLabelTitle("")
                                        }}>Hủy</button>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="label-list">
                            {labels.map((label, i) => (
                                <div key={i} className="label-item">
                                    <span style={{ background: `${label.color}` }} > {label.title}</span>
                                    <Edit size={20} />
                                    <XCircle size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                }


                <div className="menu-header">
                    <h3>Menu</h3>
                    <X size={28} className="close-btn" onClick={onClose} />
                </div>

                <ul className="menu-list">
                    <li onClick={() => { onClose(); setShowSharePopup(true) }}>
                        <UserPlus size={20} />
                        <span>Chia sẻ</span>
                    </li>

                    <li onClick={() => setShowInfo(true)}>
                        <Info size={20} />
                        <span>Về bảng này</span>
                    </li>

                    <li>
                        <Share2 size={20} />
                        <span>In, xuất và chia sẻ</span>
                    </li>

                    <li onClick={() => setIsStarred(prev => !prev)}>
                        <button className="star-btn-menu">
                            {isStarred ? "★" : "☆"}
                        </button>
                        <span>Gắn sao</span>
                    </li>

                    <li>
                        <Settings size={20} />
                        <span>Cài đặt</span>
                    </li>

                    <li onClick={() => setShowLabel(true)} >
                        <Tags size={20} />
                        <span>Nhãn</span>
                    </li>

                    <li onClick={() => setShowStore(true)}>
                        <Archive size={20} />
                        <span>Lưu trữ</span>
                    </li>

                    <li onClick={() => setChangeBackground(true)}>
                        <Image size={20} />
                        <span>Thay đổi hình nền</span>

                    </li>
                </ul>
            </div>
        </div >
    );
};

export default MenuBoardPopup;
