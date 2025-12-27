import React, { useState, useEffect, useRef } from 'react'
import './ManagementTable.css'
import { useParams } from 'react-router-dom'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import SharingPopup from '../../components/SharingPopup/SharingPopup.jsx'
import MenuBoardPopup from '../../components/MenuBoardPopup/MenuBoardPopup.jsx'
import boardService from '../../services/boardService'

const ManagementTable = () => {
    const { boardId } = useParams();

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
    
    const labelColors = ["#FF7043", "#FFA726", "#FFEB3B", "#66BB6A", "#42A5F5", "#AB47BC"];
    const [labels, setLabels] = useState([])

    const getBackgroundStyle = (bgString) => {
        if (!bgString) return { background: "#0079bf" };

        if (bgString.startsWith('http')) {
            return { 
                backgroundImage: `url(${bgString})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        }
        
        if (bgString.includes(',')) {
            return { background: `linear-gradient(135deg, ${bgString})` };
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

    useEffect(() => {
        setLabels(
            labelColors.map(color => ({
                id: crypto.randomUUID(),
                color,
                title: null
            }))
        )
    }, [])

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

    const addNewList = (listTitle) => {
        if (listTitle) {
            setColumns([...columns, { id: crypto.randomUUID(), title: listTitle, cards: [], addCard: false, storedDate: null }]);
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

    const updateTitleColumn = (colId, newTitle) => {
        setColumns(cols => cols.map(c => c.id === colId ? { ...c, title: newTitle } : c));
    }

    const addLabel = (color, title) => {
        setLabels(pre => [...pre, { id: crypto.randomUUID(), color: color, title: title }])
    }
    const deleteLabel = (labelId) => setLabels(labels.filter(label => label.id !== labelId))
    const updateLabel = (labelId, labelColor, labelTitle) => {
        const newLabels = labels.map(l => l.id === labelId ? { ...l, color: labelColor, title: labelTitle } : l)
        setLabels(newLabels)
    }

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    if (!boardData) {
        return (
            <div className="loading-container">Đang tải dữ liệu Board...</div>
        )
    }

    return (
        <div className="man-table-container" style={getBackgroundStyle(rawColor)}>
            {showCardDetailPopup &&
                <CardDetailPopup
                    card={cardDetail}
                    onClose={() => setShowCardDetailPopup(false)}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    storeCard={storeCard}
                    labels={labels}
                    setLabels={setLabels}
                    addLabel={addLabel}
                    updateLabel={updateLabel}
                />}
            {showSharePopup && <SharingPopup onClose={() => setShowSharePopup(false)} />}
            
            {showMenuBoardPopup &&
                <MenuBoardPopup
                    onClose={() => setShowMenuBoardPopup(false)}
                    setShowSharePopup={setShowSharePopup}
                    setRawColor={handleUpdateBackground} 
                    rawColor={rawColor}
                    setIsStarred={setIsStarred}
                    isStarred={isStarred}
                    boardDes={boardDes}
                    setBoardDes={handleUpdateBoardDes}
                    storedCards={storedCards}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    activateCard={activateCard}
                    storedColumns={storedColumns}
                    activateColumn={activateColumn}
                    labels={labels}
                    addLabel={addLabel}
                    deleteLabel={deleteLabel}
                    updateLabel={updateLabel}
                />
            }

            <div className={`main-content ${boardWide}`}>
                <div className="board-top-bar">
                    <div className="board-info-edit">
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