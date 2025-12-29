import React, { useState, useEffect, useRef } from 'react'
import './ManagementTable.css'
import { useParams, useNavigate } from 'react-router-dom'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import SharingPopup from '../../components/SharingPopup/SharingPopup.jsx'
import MenuBoardPopup from '../../components/MenuBoardPopup/MenuBoardPopup.jsx'
import boardService from '../../services/boardService'
import listService from '../../services/listService';

export const BOARD_LABEL_COLORS = [
    "#4BCE97", "#E2B203", "#FAA53D", "#F87462", "#9F8FEF", "#579DFF", 
    "#60C6D2", "#94C748", "#E774BB", "#8590A2", "#B3DF3B", "#F5CD47", 
    "#FEA362", "#F87168", "#76BB86", "#6CC3E0", "#E1B309", "#172B4D", 
    "#0052CC", "#C1C7D0" 
];

const ManagementTable = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [boardData, setBoardData] = useState(null);
    const [boardTitle, setBoardTitle] = useState(""); 
    const [boardDes, setBoardDes] = useState("");
    
    const descTextareaRef = useRef(null);

    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [cardDetail, setCardDetail] = useState({})
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showMenuBoardPopup, setShowMenuBoardPopup] = useState(false)
    const [showInbox, setShowInbox] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);

    const [columns, setColumns] = useState([]);
    const [cards, setCards] = useState([])
    const [storedCards, setStoredCards] = useState([])
    const [storedColumns, setStoredColumns] = useState([])

    const [rawColor, setRawColor] = useState("#0079bf")
    
    const [isStarred, setIsStarred] = useState(false)
    const [activeLabelIndices, setActiveLabelIndices] = useState([]);
    const [visibility, setVisibility] = useState(0);

    const getBackgroundStyle = (bgString) => {
        const style = {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };

        if (!bgString) return { ...style, backgroundColor: "#0079bf" };

        if (bgString.startsWith('http')) {
            return { ...style, backgroundImage: `url(${bgString})` };
        }
        
        if (bgString.includes(',')) {
            return { ...style, backgroundImage: `linear-gradient(135deg, ${bgString})` };
        }

        return { backgroundColor: bgString };
    };

    useEffect(() => {
        if (!boardId) return;

        const fetchBoardFull = async () => {
            try {
                const response = await boardService.getBoardFull(boardId);
                const data = response.data.value || response.data;

                const apiBoard = data.board || data;
                const apiLists = data.lists || [];
                const apiCards = data.cards || [];

                setBoardData(apiBoard);
                setBoardTitle(apiBoard.title || "Chưa có tiêu đề");
                setBoardDes(apiBoard.description || "");
                setRawColor(apiBoard.background || "#0079bf");
                
                setIsStarred(apiBoard.pinned || false);
                setActiveLabelIndices(apiBoard.label || []); 
                if (apiBoard.visibility !== undefined) {
                    setVisibility(apiBoard.visibility);
                }

                const mappedColumns = apiLists.map(list => {
                    const listCards = apiCards
                        .filter(c => (c.listId === list.id || c.columnId === list.id))
                        .map(c => ({
                            id: c.id,
                            title: c.title,
                            columnId: list.id,
                            label: c.label || null, 
                            members: c.members || [],
                            deadline: c.deadline || null,
                            check: c.isCompleted || false,
                            description: c.description,
                            edit: false,
                            storedDate: c.storedDate || null
                        }));

                    return {
                        id: list.id,
                        title: list.title,
                        cards: listCards,
                        addCard: false,
                        storedDate: list.storedDate || null
                    };
                });
                
                setColumns(mappedColumns);

            } catch (error) {
                console.error("Lỗi tải dữ liệu Board:", error);
            }
        };

        fetchBoardFull();
    }, [boardId]);

    useEffect(() => {
        const allCards = columns.flatMap(column => column.cards);
        setCards(allCards);
    }, [columns]);

    useEffect(() => {
        const textarea = descTextareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [boardDes]);

    const handleTitleUpdate = async () => {
        if (!boardTitle.trim()) {
            setBoardTitle(boardData?.title || ""); 
            return;
        }
        if (boardData && boardTitle === boardData.title) return; 

        try {
            await boardService.updateTitle(boardId, boardTitle);
            setBoardData(prev => ({ ...prev, title: boardTitle }));
        } catch (error) {
            console.error("Lỗi cập nhật tiêu đề:", error);
        }
    }

    const handleDescriptionUpdate = async () => {
        if (boardData && boardDes === (boardData.description || "")) return;

        try {
            await boardService.updateDescription(boardId, boardDes);
            setBoardData(prev => ({ ...prev, description: boardDes }));
        } catch (error) {
            console.error("Lỗi cập nhật mô tả:", error);
        }
    }

    const handleUpdateBoardDes = async (newDes) => {
        setBoardDes(newDes);
        try {
             await boardService.updateDescription(boardId, newDes);
             setBoardData(prev => ({ ...prev, description: newDes }));
        } catch (e) { console.error(e) }
    }

    const handleDeleteBoard = async () => {
        const confirmDelete = window.confirm(
            "CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn bảng này?\nHành động này không thể hoàn tác!"
        );

        if (!confirmDelete) return;

        try {
            await boardService.delete(boardId);
            
            alert("Đã xóa bảng thành công!");
            navigate('/');
        } catch (error) {
            console.error("Lỗi xóa bảng:", error);
            alert("Xóa bảng thất bại. Vui lòng thử lại sau.");
        }
    };

    const handleUpdateBackground = async (newColor) => {
        setRawColor(newColor);
        try {
            await boardService.updateBackground(boardId, newColor);
        } catch (error) {
            console.error("Lỗi cập nhật hình nền:", error);
        }
    }

    const updateCardInColumn = (columnId, cardId, field, value) => {
        setColumns(prev => prev.map(col => col.id === columnId ? {
            ...col, cards: col.cards.map(card => card.id === cardId ? { ...card, [field]: value } : card)
        } : col));
    };

    const storeCard = (card) => {
        const now = new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
        const updated = [...columns]
        const col = updated.findIndex(c => c.id === card.columnId)
        if (col === -1) return;
        const cardIndex = updated[col].cards.findIndex(c => c.id === card.id)
        if (cardIndex === -1) return;
        const [movedCard] = updated[col].cards.splice(cardIndex, 1);
        setStoredCards(prev => [...prev, { ...movedCard, storedDate: now }])
        setColumns(updated)
    }

    const activateCard = (cardIdex) => {
        const store = [...storedCards]
        const [movedCard] = store.splice(cardIdex, 1)
        setStoredCards(store)
        const updated = [...columns]
        const col = updated.findIndex(c => c.id === movedCard.columnId)
        if (col !== -1) {
            updated[col].cards.push({ ...movedCard, storedDate: null });
            setColumns(updated)
        }
    }

    const storeColumn = (columnIdex) => {
        const now = new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
        const updated = [...columns]
        const [col] = updated.splice(columnIdex, 1)
        setStoredColumns(pre => [...pre, { ...col, storedDate: now }])
        setColumns(updated)
    }

    const activateColumn = (columnIdex) => {
        const store = [...storedColumns]
        const [col] = store.splice(columnIdex, 1)
        setStoredColumns(store)
        const updated = [...columns]
        updated.push({ ...col, storedDate: null })
        setColumns(updated)
    }

    const addNewList = async (listTitle) => {
        if (!listTitle.trim()) return;

        try {
            const response = await listService.create({
                boardId: boardId,
                title: listTitle
            });

            const apiList = response.data.value || response.data;

            const newList = {
                id: apiList.id,
                title: apiList.title,
                cards: [],
                addCard: false,
                storedDate: null
            };

            setColumns([...columns, newList]);

        } catch (error) {
            console.error("Lỗi khi tạo danh sách mới:", error);
            alert("Không thể tạo danh sách. Vui lòng thử lại!");
        }
    }

    const handleMoveList = async (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || toIndex < 0 || toIndex >= columns.length) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);

        setColumns(newColumns);

        try {
            await listService.updatePosition(movedColumn.id, toIndex);
        } catch (error) {
            console.error("Lỗi cập nhật vị trí List:", error);
            alert("Không thể cập nhật vị trí danh sách!");
        }
    }

    const addCard = (col, cardTitle) => {
        if (cardTitle.trim()) {
            const updated = [...columns];
            updated[col].cards.push({
                id: crypto.randomUUID(), title: cardTitle, columnId: updated[col].id,
                label: null, members: [], deadline: null, check: false, description: null, edit: false, storedDate: null
            });
            setColumns(updated);
        }
    }

    const updateTitleColumn = async (colId, newTitle) => {
        if (!newTitle.trim()) return;

        const originalColumns = [...columns];
        setColumns(cols => cols.map(c => c.id === colId ? { ...c, title: newTitle } : c));

        try {
            await listService.updateTitle(colId, newTitle);
        } catch (error) {
            console.error("Lỗi cập nhật tên List:", error);
            setColumns(originalColumns);
            alert("Không thể đổi tên danh sách. Vui lòng thử lại!");
        }
    }

    const handleToggleLabel = async (colorIndex) => {
        let newIndices;
        if (activeLabelIndices.includes(colorIndex)) {
            newIndices = activeLabelIndices.filter(i => i !== colorIndex);
        } else {
            newIndices = [...activeLabelIndices, colorIndex];
        }
        setActiveLabelIndices(newIndices);
        try {
            await boardService.updateLabels(boardId, newIndices);
        } catch (error) {
            console.error("Lỗi cập nhật nhãn:", error);
        }
    }

    const handleUpdateVisibility = async (newVisibility) => {
        setVisibility(newVisibility);
        try {
            await boardService.updateVisibility(boardId, newVisibility);
        } catch (error) {
            console.error("Lỗi cập nhật chế độ hiển thị:", error);
        }
    };

    const handleTogglePinned = async () => {
        const newStatus = !isStarred;
        setIsStarred(newStatus);
        try {
            await boardService.updatePinned(boardId, newStatus);
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái ghim:", error);
            setIsStarred(!newStatus);
        }
    };

    const handleDuplicateBoard = async (copyLists, copyCards) => {
        try {
            const response = await boardService.duplicate(boardId, copyLists, copyCards);
            const newBoard = response.data.value || response.data;

            if (newBoard && newBoard.id) {
                setShowMenuBoardPopup(false);
                navigate(`/board/${newBoard.id}`);
                window.location.reload(); 
            }
        } catch (error) {
            console.error("Lỗi sao chép bảng:", error);
            alert("Sao chép bảng thất bại. Vui lòng thử lại!");
        }
    }

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    if (!boardData) {
        return (
            <div className="loading-container">Đang tải dữ liệu Board...</div>
        )
    }

    return (
        <div className="man-table-container">
            <div 
                className="board-background-layer" 
                style={getBackgroundStyle(rawColor)} 
            />

            {showCardDetailPopup &&
                <CardDetailPopup
                    card={cardDetail}
                    onClose={() => setShowCardDetailPopup(false)}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    storeCard={storeCard}
                    boardLabelColors={BOARD_LABEL_COLORS}
                />}
            {showSharePopup && <SharingPopup onClose={() => setShowSharePopup(false)} />}
            
            {showMenuBoardPopup &&
                <MenuBoardPopup
                    onClose={() => setShowMenuBoardPopup(false)}
                    setShowSharePopup={setShowSharePopup}
                    setRawColor={handleUpdateBackground} 
                    rawColor={rawColor}
                    boardDes={boardDes}
                    setBoardDes={handleUpdateBoardDes}
                    storedCards={storedCards}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    activateCard={activateCard}
                    storedColumns={storedColumns}
                    activateColumn={activateColumn}
                    labelColors={BOARD_LABEL_COLORS}
                    activeLabelIndices={activeLabelIndices}
                    onToggleLabel={handleToggleLabel}
                    visibility={visibility}
                    onUpdateVisibility={handleUpdateVisibility}
                    isStarred={isStarred}
                    onTogglePinned={handleTogglePinned}
                    onDuplicateBoard={handleDuplicateBoard} 
                    onDeleteBoard={handleDeleteBoard}
                />
            }

            <div className="board-top-bar">
                <div className="board-info-edit">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%'}}>
                        <input 
                            className="board-title-input"
                            value={boardTitle}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            onBlur={handleTitleUpdate}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur(); 
                                }
                            }}
                            placeholder="Tiêu đề bảng"
                        />
                        <button 
                            onClick={handleTogglePinned}
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                fontSize: '24px', color: isStarred ? '#f2d600' : 'rgba(255,255,255,0.4)',
                                transition: 'color 0.2s', padding: 0
                            }}
                            title={isStarred ? "Bỏ gắn sao" : "Gắn sao"}
                        >
                            {isStarred ? "★" : "☆"}
                        </button>
                    </div>
                    
                    <textarea 
                        ref={descTextareaRef}
                        className="board-desc-input"
                        value={boardDes}
                        onChange={(e) => setBoardDes(e.target.value)}
                        onBlur={handleDescriptionUpdate}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); 
                                e.target.blur();
                            }
                        }}
                        placeholder="Thêm mô tả..."
                        rows={1}
                    />
                </div>
                
                <button className="board-menu-btn" onClick={() => setShowMenuBoardPopup(true)}>
                    ... Menu
                </button>
            </div>

            <div className={`main-content ${boardWide}`}>
                {showInbox && <Inbox onClose={() => setShowInbox(false)} />}
                {showPlanner && <Planner onClose={() => setShowPlanner(false)} />}

                <TaskBoard
                    cards={cards}
                    setCards={setCards}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    addNewList={addNewList}
                    addCard={addCard}
                    setShowSharePopup={setShowSharePopup}
                    setShowMenuBoardPopup={setShowMenuBoardPopup}
                    rawColor={rawColor}
                    isStarred={isStarred}
                    setIsStarred={setIsStarred}
                    storeCard={storeCard}
                    storeColumn={storeColumn}
                    updateTitleColumn={updateTitleColumn}
                    boardLabelColors={BOARD_LABEL_COLORS}
                    handleDragEnd={handleMoveList}
                />
            </div>

            <div className="toggle-floating-panel">
                {!showInbox && (
                    <div className="toggle-icon" onClick={() => setShowInbox(true)}>
                        Inbox
                    </div>
                )}
                {!showPlanner && (
                    <div className="toggle-icon" onClick={() => setShowPlanner(true)}>
                        Planner
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManagementTable