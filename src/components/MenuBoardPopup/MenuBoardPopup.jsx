import React, { useState, useEffect } from "react";
import "./MenuBoardPopup.css";
import { 
    X, UserPlus, Settings, Image, Share2, Info, ArrowLeft, 
    UserRound, Archive, Trash2, ArchiveX, Tags, 
    Check, Copy, UserCogIcon 
} from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea/AutoResizeTextarea";
import listService from "../../services/listService";

const VISIBILITY_OPTIONS = [
    {
        value: 0,
        title: "Riêng tư",
        desc: "Chỉ thành viên bảng mới có thể xem."
    },
    {
        value: 2,
        title: "Không gian làm việc",
        desc: "Tất cả thành viên Workspace có thể xem."
    },
    {
        value: 1,
        title: "Công khai",
        desc: "Bất kỳ ai cũng có thể xem."
    }
];

const MenuBoardPopup = ({
    boardId,
    onClose,
    setShowSharePopup,
    setRawColor,
    rawColor,
    boardDes,
    setBoardDes,
    storedCards,
    setShowCardDetailPopup,
    setCardDetail,
    activateCard,
    storedColumns,
    setStoredColumns,
    activateColumn,
    labelColors,
    activeLabelIndices,
    onToggleLabel,
    visibility,
    onUpdateVisibility,
    isStarred,
    onTogglePinned,
    onDuplicateBoard,
    onDeleteBoard
}) => {
    const [tab, setTab] = useState("menu");
    const [backgroundType, setBackgroundType] = useState("gradient");
    const gradientOptions = [
        "#9abcf2ff, #dff4ffff", "#764ba2, #dbe1ffff", "#dc7e81ff, #ffebe6ff", "#cef930ff, #f5f9deff",
        "#4e5cdeff, #83f7f7ff", "#28945dff, #e6ffe7ff", "#ef61c2ff, #eddca6ff", "#151239ff, #2330a9ff",
    ];
    const solidColors = [
        "#4BA3C3", "#7B1FA2", "#D32F2F", "#388E3C",
        "#1976D2", "#e5fc51ff", "#ee3dd9ff", "#241f61ff",
    ];
    const imageOptions = [
        "https://images.unsplash.com/photo-1697464082987-1422c5c56c8f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1707343848552-893e05dba6ac?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000&auto=format&fit=crop",
    ];

    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [desc, setDesc] = useState(boardDes);
    const [storedCategory, setStoredCategory] = useState("card");
    const [showVisibility, setShowVisibility] = useState(false);
    const [copyLists, setCopyLists] = useState(true);
    const [copyCards, setCopyCards] = useState(true);

    useEffect(() => {
        if (tab === "achieve" && storedCategory === "list" && boardId) {
            const fetchArchivedLists = async () => {
                try {
                    const response = await listService.getLists(boardId);
                    const allLists = response.data.value || response.data;
                    
                    const archivedOnly = allLists.filter(l => l.isArchived);

                    const formattedLists = archivedOnly.map(l => ({
                        id: l.id,
                        title: l.title,
                        cards: [],
                        addCard: false,
                        isArchived: true
                    }));

                    setStoredColumns(formattedLists);
                } catch (error) {
                    console.error("Lỗi tải danh sách lưu trữ:", error);
                }
            };

            fetchArchivedLists();
        }
    }, [tab, storedCategory, boardId]);

    return (
        <div className="menu-overlay" onClick={onClose}>
            <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
                
                {tab === "background" &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Phông nền</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
                        </div>

                        <div className="bg-tabs">
                            <button onClick={() => setBackgroundType("gradient")} className={backgroundType === "gradient" ? "active-tab" : "tab"}>Gradient</button>
                            <button onClick={() => setBackgroundType("image")} className={backgroundType === "image" ? "active-tab" : "tab"}>Ảnh</button>
                            <button onClick={() => setBackgroundType("solid")} className={backgroundType === "solid" ? "active-tab" : "tab"}>Màu đơn</button>
                        </div>

                        <div className="bg-grid-menu">
                            {backgroundType === "gradient" && gradientOptions.map((g, i) => (
                                <div key={i} onClick={() => setRawColor(g)} className={rawColor === g ? "bg-item-menu active-bg" : "bg-item-menu"} style={{ background: `linear-gradient(135deg, ${g})` }} />
                            ))}
                            {backgroundType === "image" && imageOptions.map((img, i) => (
                                <div key={i} onClick={() => setRawColor(img)} className={rawColor === img ? "bg-item-menu bg-img active-bg" : "bg-item-menu bg-img"} style={{ backgroundImage: `url(${img})` }} />
                            ))}
                            {backgroundType === "solid" && solidColors.map((c, i) => (
                                <div key={i} onClick={() => setRawColor(c)} className={rawColor === c ? "bg-item-menu active-bg" : "bg-item-menu"} style={{ background: c }} />
                            ))}
                        </div>
                    </div>
                }

                {tab === "achieve" &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Kho lưu trữ</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
                        </div>

                        <div className="store-cat">
                            <button onClick={() => setStoredCategory("card")} className={storedCategory === "card" ? "active-tab" : "tab"}>Thẻ nhiệm vụ</button>
                            <button onClick={() => setStoredCategory("list")} className={storedCategory === "list" ? "active-tab" : "tab"}>Danh sách</button>
                        </div>

                        <div className="store">
                            {storedCategory === "card" && storedCards.map((card, i) =>
                                <div key={i} className="stored-card-item" style={card.label ? { backgroundColor: card.label, color: "white" } : { background: "white" }}>
                                    <input type="checkbox" checked={card.check} readOnly />
                                    <p onClick={() => { setCardDetail(card), setShowCardDetailPopup(true), onClose() }}>{card.title}</p>
                                    <ArchiveX className="activate-btn" size={20} onClick={() => activateCard(i)} title="Gửi lại vào bảng" />
                                    <Trash2 className="delete-btn" size={20} title="Xóa" />
                                </div>
                            )}
                            {storedCategory === "list" && storedColumns.map((col, i) =>
                                <div key={i} className="stored-column-item">
                                    <p style={{fontWeight: 500}}>{col.title}</p>
                                    <div className="stored-actions">
                                        <ArchiveX 
                                            className="activate-btn" 
                                            size={20} 
                                            onClick={() => activateColumn(i)} 
                                            title="Khôi phục danh sách này"
                                            style={{cursor: 'pointer', marginRight: '8px'}}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {storedCategory === "list" && storedColumns.length === 0 && (
                                <div style={{textAlign: 'center', color: '#5e6c84', marginTop: '20px'}}>Không có danh sách nào được lưu trữ.</div>
                            )}
                             {storedCategory === "card" && storedCards.length === 0 && (
                                <div style={{textAlign: 'center', color: '#5e6c84', marginTop: '20px'}}>Không có thẻ nào được lưu trữ.</div>
                            )}
                        </div>
                    </div>
                }

                {tab === "info" &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Thông tin</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
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
                            <AutoResizeTextarea value={desc} onChange={(e) => setDesc(e.target.value)} onFocus={() => setIsEditingDesc(true)} />
                            {isEditingDesc && (
                                <div className="desc-actions">
                                    <button onClick={() => { setDesc(boardDes || ""); setIsEditingDesc(false) }} className="btn">Hủy</button>
                                    <button onClick={() => { setBoardDes(desc); setIsEditingDesc(false) }} className="btn primary">Lưu</button>
                                </div>
                            )}
                        </div>
                    </div>
                }

                {tab === "label" &&
                    <div className="menu-container">
                         <div className="menu-header">
                            <h3>Nhãn đánh dấu</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
                        </div>
                        <div style={{ padding: '0 0 12px 0', color: '#5e6c84', fontSize: '14px' }}>Chọn các màu để kích hoạt cho bảng này:</div>
                        
                        <div className="label-grid-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {labelColors && labelColors.map((colorHex, index) => {
                                const isActive = activeLabelIndices.includes(index);
                                return (
                                    <div 
                                        key={index} 
                                        onClick={() => onToggleLabel(index)} 
                                        style={{ 
                                            backgroundColor: colorHex, 
                                            height: '40px', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            transition: 'transform 0.1s', 
                                            border: isActive ? '2px solid #000' : 'none',
                                            transform: isActive ? 'scale(0.95)' : 'none'
                                        }} 
                                        className="label-color-item"
                                    >
                                        {isActive && <Check color="white" size={20} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                }

                {tab === "setting" &&
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Cài đặt</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
                        </div>
                        <div className="bs-content">
                            <section className="bs-section">
                                <h3>Không gian làm việc</h3>
                                <p className="bs-muted">Trello Không gian làm việc</p>
                            </section>
                            <section className="bs-section">
                                <h3>Quyền</h3>
                                <div className="bs-item">
                                    <div>
                                        <div className="bs-item-title">Chỉnh sửa Không gian làm việc<Check size={14} className="bs-check" /></div>
                                        <div className="bs-item-desc">Mọi thành viên có thể chỉnh sửa và tham gia.</div>
                                    </div>
                                </div>
                            </section>

                            <section className="bs-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <h3 style={{ color: '#c92a2a' }}>Vùng nguy hiểm</h3>
                                <div 
                                    className="bs-item delete-board-btn" 
                                    onClick={onDeleteBoard}
                                    style={{ 
                                        backgroundColor: '#fff5f5', 
                                        border: '1px solid #ffe3e3' 
                                    }}
                                >
                                    <div className="bs-item-title" style={{ color: '#c92a2a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Trash2 size={16} /> Xóa bảng này
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                }

                {tab === "copy" && (
                    <div className="menu-container">
                        <div className="menu-header">
                            <h3>Sao chép bảng</h3>
                            <ArrowLeft className="close-btn" size={28} onClick={() => setTab("menu")} />
                        </div>
                        
                        <div className="bs-content">
                            <div style={{padding: '0 0 15px 0', color: '#5e6c84', fontSize: '14px'}}>
                                Tạo một bản sao của bảng hiện tại với các tùy chọn:
                            </div>

                            <div className="bs-section">
                                <div 
                                    className="bs-item" 
                                    onClick={() => {
                                        const newVal = !copyLists;
                                        setCopyLists(newVal);
                                        if (!newVal) setCopyCards(false); 
                                    }}
                                >
                                    <div className="bs-item-title">
                                        Sao chép danh sách (Lists)
                                    </div>
                                    {copyLists && <Check size={18} className="bs-check" color="#0079bf"/>}
                                </div>

                                <div 
                                    className="bs-item" 
                                    style={{ marginTop: '8px', opacity: copyLists ? 1 : 0.5, pointerEvents: copyLists ? 'auto' : 'none' }}
                                    onClick={() => setCopyCards(!copyCards)}
                                >
                                    <div className="bs-item-title">
                                        Sao chép thẻ (Cards)
                                    </div>
                                    {copyCards && <Check size={18} className="bs-check" color="#0079bf"/>}
                                </div>

                                <button 
                                    className="btn primary" 
                                    style={{marginTop: '20px', width: '100%', padding: '10px'}}
                                    onClick={() => onDuplicateBoard(copyLists, copyCards)}
                                >
                                    Tạo bản sao
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "menu" && <div className="menu-container">
                    <div className="menu-header">
                        <h3>Menu</h3>
                        <X size={28} className="close-btn" onClick={onClose} />
                    </div>

                    <ul className="menu-list">
                        <li onClick={() => { onClose(); setShowSharePopup(true) }}>
                            <UserPlus size={20} />
                            <span>Chia sẻ</span>
                        </li>

                        <li onClick={() => setTab("info")}>
                            <Info size={20} />
                            <span>Về bảng này</span>
                        </li>

                        <li className={`show-visibility ${showVisibility ? "open" : ""}`} onClick={() => setShowVisibility(true)}>
                            <UserCogIcon size={20} />
                            <div className="select-visibility-content">
                                <span>Khả năng hiển thị</span>
                                <div className="visibility-wrapper">
                                    {showVisibility && (
                                        <div className="visibility-drop">
                                            {VISIBILITY_OPTIONS.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        onUpdateVisibility(option.value); 
                                                        setShowVisibility(false);
                                                    }}
                                                >
                                                    <p className="item-title">{option.title}</p>
                                                    <p className="item-desc">{option.desc}</p>
                                                    {visibility === option.value && <Check className="check-icon" size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>

                        <li onClick={() => setTab("copy")}>
                            <Copy size={20} />
                            <span>Sao chép bảng</span>
                        </li>

                        <li>
                            <Share2 size={20} />
                            <span>In, xuất và chia sẻ</span>
                        </li>

                        <li onClick={onTogglePinned}>
                            <button 
                                className="star-btn-menu" 
                                style={{
                                    color: isStarred ? '#f2d600' : 'inherit',
                                    fontWeight: isStarred ? 'bold' : 'normal'
                                }}
                            >
                                {isStarred ? "★" : "☆"}
                            </button>
                            <span>{isStarred ? "Đã gắn sao" : "Gắn sao bảng này"}</span>
                        </li>

                        <li onClick={() => setTab("setting")}>
                            <Settings size={20} />
                            <span>Cài đặt</span>
                        </li>

                        <li onClick={() => setTab("label")} >
                            <Tags size={20} />
                            <span>Nhãn</span>
                        </li>

                        <li onClick={() => setTab("achieve")}>
                            <Archive size={20} />
                            <span>Lưu trữ</span>
                        </li>

                        <li onClick={() => setTab("background")}>
                            <Image size={20} />
                            <span>Thay đổi hình nền</span>
                        </li>
                    </ul>
                </div>
                }
            </div>
        </div >
    );
};

export default MenuBoardPopup;