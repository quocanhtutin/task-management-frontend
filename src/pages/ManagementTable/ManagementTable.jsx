import React, { useState, useEffect, useRef } from 'react'
import './ManagementTable.css'
import { useParams, useNavigate } from 'react-router-dom'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import SharingPopup from '../../components/SharingPopup/SharingPopup.jsx'
import MenuBoardPopup from '../../components/MenuBoardPopup/MenuBoardPopup.jsx'
import MoveListPopup from '../../components/MoveListPopup/MoveListPopup.jsx'
import boardService from '../../services/boardService'
import listService from '../../services/listService'
import cardService from '../../services/cardService'

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
    const [undoState, setUndoState] = useState(null);
    
    const descTextareaRef = useRef(null);

    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [cardDetail, setCardDetail] = useState({})
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showMenuBoardPopup, setShowMenuBoardPopup] = useState(false)
    const [showInbox, setShowInbox] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);
    const [showMoveListPopup, setShowMoveListPopup] = useState(false);
    const [selectedListToMove, setSelectedListToMove] = useState(null);

    const [columns, setColumns] = useState([]);
    const [cards, setCards] = useState([])
    const [storedCards, setStoredCards] = useState([])
    const [storedColumns, setStoredColumns] = useState([])

    const [rawColor, setRawColor] = useState("#0079bf")

    const [isStarred, setIsStarred] = useState(false)
    const [activeLabelIndices, setActiveLabelIndices] = useState([]);
    const [visibility, setVisibility] = useState(0);

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

                const mapListToColumn = (list) => {
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
                        storedDate: list.storedDate || null,
                        isArchived: list.isArchived
                    };
                };

                const activeLists = apiLists.filter(l => !l.isArchived).map(mapListToColumn);
                const archivedLists = apiLists.filter(l => l.isArchived).map(mapListToColumn);

                setColumns(activeLists);
                setStoredColumns(archivedLists);

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
        if (!boardTitle.trim()) { setBoardTitle(boardData?.title || ""); return; }
        if (boardData && boardTitle === boardData.title) return;

        try {
            await boardService.updateTitle(boardId, boardTitle);
            setBoardData(prev => ({ ...prev, title: boardTitle }));
        } catch (error) { console.error("Lỗi cập nhật tiêu đề:", error); }
    }

    const handleDescriptionUpdate = async () => {
        if (boardData && boardDes === (boardData.description || "")) return;
        try {
            await boardService.updateDescription(boardId, boardDes);
            setBoardData(prev => ({ ...prev, description: boardDes }));
        } catch (error) { console.error("Lỗi cập nhật mô tả:", error); }
    }

    const handleUpdateBoardDes = async (newDes) => {
        setBoardDes(newDes);
        try {
            await boardService.updateDescription(boardId, newDes);
            setBoardData(prev => ({ ...prev, description: newDes }));
        } catch (e) { console.error(e) }
    }

    const handleDeleteBoard = async () => {
        const confirmDelete = window.confirm("CẢNH BÁO: Xóa vĩnh viễn bảng này?");
        if (!confirmDelete) return;

        try {
            await boardService.delete(boardId);

            alert("Đã xóa bảng thành công!");
            navigate('/');
        } catch (error) { alert("Xóa thất bại."); }
    }

    const handleUpdateBackground = async (newColor) => {
        setRawColor(newColor);
        try { await boardService.updateBackground(boardId, newColor); } catch (e) { console.error(e); }
    }

    const updateCardInColumn = (columnId, cardId, field, value) => {
        setColumns(prev => prev.map(col => col.id === columnId ? {
            ...col, cards: col.cards.map(card => card.id === cardId ? { ...card, [field]: value } : card)
        } : col));
    }

    const handleOpenMoveList = (listId) => {
        setSelectedListToMove(listId);
        setShowMoveListPopup(true);
    }

    const handleMoveListSuccess = (movedListId) => {
        setColumns(prev => prev.filter(col => col.id !== movedListId));
        alert("Đã di chuyển danh sách sang bảng khác thành công!");
    }

    const handleSoftDeleteCard = async (cardToDelete) => {
        setShowCardDetailPopup(false);

        const originalColumns = [...columns];
        const colIndex = columns.findIndex(c => c.id === cardToDelete.columnId);
        if (colIndex === -1) return;

        const newColumns = [...columns];
        newColumns[colIndex].cards = newColumns[colIndex].cards.filter(c => c.id !== cardToDelete.id);
        setColumns(newColumns);

        try {
            await cardService.delete(cardToDelete.id);
        } catch (error) {
            console.error("Lỗi xóa card:", error);
            setColumns(originalColumns);
            alert("Có lỗi xảy ra khi xóa thẻ!");
            return;
        }

        const timeoutId = setTimeout(() => {
            setUndoState(null);
        }, 15000);

        setUndoState({
            card: cardToDelete,
            columnId: cardToDelete.columnId,
            timeoutId: timeoutId
        });
    };

    const handleUndoDelete = async () => {
        if (!undoState) return;

        clearTimeout(undoState.timeoutId);

        const { card } = undoState;

        try {
            await cardService.restore(card.id);
            
            setColumns(prev => {
                const newCols = prev.map(col => ({
                    ...col,
                    cards: [...col.cards] 
                }));

                const colIdx = newCols.findIndex(c => c.id === card.columnId);
                
                if (colIdx !== -1) {
                    const isExist = newCols[colIdx].cards.some(c => c.id === card.id);
                    
                    if (!isExist) {
                        newCols[colIdx].cards.push(card);
                    }
                }
                return newCols;
            });

            setUndoState(null);
        } catch (error) {
            console.error("Lỗi khôi phục thẻ:", error);
            alert("Không thể khôi phục thẻ!");
        }
    };

    const handleConfirmDelete = () => {
        if (undoState?.timeoutId) clearTimeout(undoState.timeoutId);
        setUndoState(null); 
    };

    const storeCard = (card) => {
        const now = new Date().toLocaleString("vi-VN");
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

    const storeColumn = async (columnIndex) => {
        const columnToArchive = columns[columnIndex];
        const listId = columnToArchive.id;

        try {
            await listService.archive(listId);

            const now = new Date().toLocaleString("vi-VN");
            const newColumns = [...columns];
            newColumns.splice(columnIndex, 1);
            setColumns(newColumns);

            setStoredColumns(prev => [...prev, { ...columnToArchive, storedDate: now }]);
        } catch (error) {
            console.error("Lỗi lưu trữ danh sách:", error);
            alert("Không thể lưu trữ danh sách!");
        }
    }

    const activateColumn = async (columnIndex) => {
        const columnToRestore = storedColumns[columnIndex];
        const listId = columnToRestore.id;

        try {
            await listService.unarchive(listId);

            const newStoredColumns = [...storedColumns];
            newStoredColumns.splice(columnIndex, 1);
            setStoredColumns(newStoredColumns);

            setColumns(prev => [...prev, { ...columnToRestore, storedDate: null }]);
        } catch (error) {
            console.error("Lỗi khôi phục danh sách:", error);
            alert("Không thể khôi phục danh sách!");
        }
    }

    const addNewList = async (listTitle) => {
        if (!listTitle.trim()) return;
        try {
            const response = await listService.create({ boardId: boardId, title: listTitle });
            const apiList = response.data.value || response.data;
            const newList = {
                id: apiList.id, title: apiList.title, cards: [], addCard: false, storedDate: null
            };
            setColumns([...columns, newList]);
        } catch (error) { console.error(error); alert("Lỗi tạo danh sách!"); }
    }

    const handleMoveList = async (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);
        setColumns(newColumns);
        try { await listService.updatePosition(movedColumn.id, toIndex); } catch (e) { console.error(e); }
    }

    const addCard = async (colIndex, cardTitle) => {
        if (!cardTitle.trim()) return;

        const listId = columns[colIndex].id;

        try {
            const response = await cardService.create({
                listId: listId,
                title: cardTitle
            });

            const newCardApi = response.data.value || response.data;
            const updatedColumns = [...columns];
            updatedColumns[colIndex].cards.push({
                id: newCardApi.id,
                title: newCardApi.title,
                columnId: listId,
                label: newCardApi.label || null,
                members: newCardApi.members || [],
                deadline: newCardApi.deadline || null,
                check: newCardApi.isCompleted || false,
                description: newCardApi.description || "",
                edit: false,
                storedDate: null
            });

            setColumns(updatedColumns);

        } catch (error) {
            console.error("Lỗi khi tạo thẻ:", error);
            alert("Không thể tạo thẻ mới, vui lòng thử lại!");
        }
    }

    const updateTitleColumn = async (colId, newTitle) => {
        if (!newTitle.trim()) return;
        const originalColumns = [...columns];
        setColumns(cols => cols.map(c => c.id === colId ? { ...c, title: newTitle } : c));
        try { await listService.updateTitle(colId, newTitle); }
        catch (error) { setColumns(originalColumns); alert("Lỗi đổi tên danh sách!"); }
    }

    const handleToggleLabel = async (colorIndex) => {
        let newIndices = activeLabelIndices.includes(colorIndex)
            ? activeLabelIndices.filter(i => i !== colorIndex)
            : [...activeLabelIndices, colorIndex];
        setActiveLabelIndices(newIndices);
        try { await boardService.updateLabels(boardId, newIndices); } catch (e) { console.error(e); }
    }

    const handleUpdateVisibility = async (newV) => {
        setVisibility(newV);
        try { await boardService.updateVisibility(boardId, newV); } catch (e) { console.error(e); }
    }

    const handleTogglePinned = async () => {
        const newStatus = !isStarred;
        setIsStarred(newStatus);
        try { await boardService.updatePinned(boardId, newStatus); }
        catch (e) { setIsStarred(!newStatus); }
    }

    const handleDuplicateBoard = async (copyLists, copyCards) => {
        try {
            const response = await boardService.duplicate(boardId, copyLists, copyCards);
            const newBoard = response.data.value || response.data;
            if (newBoard && newBoard.id) {
                setShowMenuBoardPopup(false);
                navigate(`/board/${newBoard.id}`);
                window.location.reload();
            }
        } catch (error) { alert("Sao chép thất bại!"); }
    }

    const handleDeleteCardPermanent = async (cardId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn thẻ này không? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            await cardService.delete(cardId);
            setStoredCards(prev => prev.filter(card => card.id !== cardId));

        } catch (error) {
            console.error("Lỗi xóa thẻ:", error);
            alert("Xóa thẻ thất bại, vui lòng thử lại!");
        }
    }

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    if (!boardData) {
        return <div className="loading-container">Đang tải dữ liệu Board...</div>
    }

    return (
        <div className="man-table-container">
            {/* <div className="board-background-layer" style={getBackgroundStyle(rawColor)} /> */}

            {showMoveListPopup && (
                <MoveListPopup
                    onClose={() => setShowMoveListPopup(false)}
                    listId={selectedListToMove}
                    currentBoardId={boardId}
                    onMoveSuccess={handleMoveListSuccess}
                    workspaceId={boardData?.workspaceId}
                />
            )}

            {showCardDetailPopup &&
                <CardDetailPopup
                    card={cardDetail}
                    onClose={() => setShowCardDetailPopup(false)}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    storeCard={storeCard}
                    boardLabelColors={BOARD_LABEL_COLORS}
                    onSoftDelete={handleSoftDeleteCard}
                    activeLabelIndices={activeLabelIndices}
                />}
            {showSharePopup && <SharingPopup onClose={() => setShowSharePopup(false)} />}

            {showMenuBoardPopup &&
                <MenuBoardPopup
                    boardId={boardId}
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
                    setStoredColumns={setStoredColumns}
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
                    onDeleteCard={handleDeleteCardPermanent}
                />
            }

            {/* <div className="board-top-bar">
                <div className="board-info-edit">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%'}}>
                        <input 
                            className="board-title-input"
                            value={boardTitle}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            onBlur={handleTitleUpdate}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
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
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur(); } }}
                        placeholder="Thêm mô tả..."
                        rows={1}
                    />
                </div>
                
                <button className="board-menu-btn" onClick={() => setShowMenuBoardPopup(true)}>
                    ... Menu
                </button>
            </div> */}

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
                    onSoftDelete={handleSoftDeleteCard}
                    storeColumn={storeColumn}
                    updateTitleColumn={updateTitleColumn}
                    boardId={boardId}
                    boardTitle={boardTitle}
                    boardLabelColors={BOARD_LABEL_COLORS}
                    handleDragEnd={handleMoveList}
                    onMoveList={handleOpenMoveList}
                />
            </div>

            {undoState && (
                <div className="undo-toast-overlay">
                    <div className="undo-toast-content">
                        <span>Thẻ <strong>{undoState.card.title}</strong> đã bị xóa.</span>
                        <div className="undo-actions">
                            <span style={{marginRight: '10px', fontSize: '14px'}}>Bạn có chắc chắn muốn xóa thẻ không?</span>
                            <button 
                                className="btn-undo-confirm" 
                                onClick={handleConfirmDelete}
                            >
                                Chắc chắn
                            </button>
                            <button 
                                className="btn-undo-cancel" 
                                onClick={handleUndoDelete}
                            >
                                Khôi phục
                            </button>
                        </div>
                        <div className="undo-progress-bar"></div>
                    </div>
                </div>
            )}

            <div className="toggle-floating-panel">
                {!showInbox && <div className="toggle-icon" onClick={() => setShowInbox(true)}>Inbox</div>}
                {!showPlanner && <div className="toggle-icon" onClick={() => setShowPlanner(true)}>Planner</div>}
            </div>
        </div>
    )
}

export default ManagementTable