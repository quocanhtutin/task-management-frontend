import React, { useEffect, useState } from 'react'
import './ColumnMode.css'
import { Archive, PenSquareIcon, ArrowRightCircle, Trash2 } from 'lucide-react'
import cardService from '../../services/cardService';

const ColumnMode = ({
    columns,
    setColumns,
    input,
    setInput,
    displayAddCard,
    addCard,
    onToggleStatus,
    setCardDetail,
    setShowCardDetailPopup,
    updateCardInColumn,
    addNewList,
    storeCard,
    storeColumn,
    updateTitleColumn,
    handleDragEnd,
    onMoveList,
    onSoftDelete,
    boardLabelColors = []
}) => {

    const [showAddColumn, setShowAddColumn] = useState(false)
    const [newColumn, setNewColumn] = useState("")

    const [editingColId, setEditingColId] = useState(null);
    const [columnTitleInput, setColumnTitleInput] = useState("");
    const [titleError, setTitleError] = useState("");

    const startEditColumn = (col) => {
        setEditingColId(col.id);
        setColumnTitleInput(col.title);
        setTitleError("");
    };

    const handleColumnTitleBlur = (col) => {
        if (!columnTitleInput.trim()) {
            setTitleError("Tên cột không được để trống");
            return;
        }
        updateTitleColumn(col.id, columnTitleInput.trim());
        setEditingColId(null);
        setTitleError("");
    };

    const onDragStart = (e, fromCol, fromIndex) => {
        e.dataTransfer.setData("type", "card");
        e.dataTransfer.setData('fromCol', fromCol);
        e.dataTransfer.setData('fromIndex', fromIndex);
    };

    const onColumnDragStart = (e, colIndex) => {
        e.dataTransfer.setData("type", "column");
        e.dataTransfer.setData("colIndex", colIndex);
    };

    const allowDrop = (e) => e.preventDefault();

    const onDrop = async (e, toColIndex) => {
        const type = e.dataTransfer.getData("type");
        if (type !== "card") return;
        
        const fromColIndex = parseInt(e.dataTransfer.getData('fromCol'), 10);
        const fromCardIndex = parseInt(e.dataTransfer.getData('fromIndex'), 10);

        if (isNaN(fromColIndex) || isNaN(fromCardIndex)) return;

        const updated = columns.map(c => ({...c, cards: [...c.cards]}));
        
        const [movedCard] = updated[fromColIndex].cards.splice(fromCardIndex, 1);
        const cardWithNewCol = { ...movedCard, columnId: updated[toColIndex].id };
        
        updated[toColIndex].cards.push(cardWithNewCol);
        setColumns(updated);

        try {
            const cardId = movedCard.id;
            const toListId = updated[toColIndex].id;
            const newPosition = updated[toColIndex].cards.length - 1; 

            await cardService.move(cardId, {
                cardId: cardId,
                toListId: toListId,
                newPosition: newPosition
            });
        } catch (error) {
            console.error("Lỗi di chuyển thẻ:", error);
        }
    };

    const onDropBeforeCard = async (e, targetCardIndex, toColIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        const fromColIndex = parseInt(e.dataTransfer.getData('fromCol'), 10);
        const fromCardIndex = parseInt(e.dataTransfer.getData('fromIndex'), 10);

        if (isNaN(fromColIndex) || isNaN(fromCardIndex)) return;

        const updated = columns.map(c => ({...c, cards: [...c.cards]}));
        
        const [movedCard] = updated[fromColIndex].cards.splice(fromCardIndex, 1);
        const cardWithNewCol = { ...movedCard, columnId: updated[toColIndex].id };
        
        updated[toColIndex].cards.splice(targetCardIndex, 0, cardWithNewCol);
        setColumns(updated);

        try {
            const cardId = movedCard.id;
            const toListId = updated[toColIndex].id;
            const newPosition = targetCardIndex;

            await cardService.move(cardId, {
                cardId: cardId,
                toListId: toListId,
                newPosition: newPosition
            });
        } catch (error) {
            console.error("Lỗi di chuyển thẻ:", error);
        }
    };

    const onColumnDrop = (e, targetColIndex) => {
        const type = e.dataTransfer.getData("type")
        if (type !== "column") return   

        const fromIndex = parseInt(e.dataTransfer.getData("colIndex"), 10);
        
        if (fromIndex !== targetColIndex) {
            handleDragEnd(fromIndex, targetColIndex);
        }
    };

    const addColumn = () => {
        const title = newColumn;
        addNewList(title)
        setNewColumn("")
        setShowAddColumn(false)
    };

    return (
        <div className="board-scroll">
            {columns.map((col, i) => (
                <div
                    key={i}
                    className="board-column"
                    onDrop={(e) => {
                        if (e.dataTransfer.getData("type") === "column")
                            onColumnDrop(e, i);
                        else
                            onDrop(e, i);
                    }}
                    onDragOver={allowDrop}
                >
                    {editingColId === col.id ? (
                        <div className='column-header'>
                            <input
                                className="edit-column-input"
                                value={columnTitleInput}
                                autoFocus
                                onChange={(e) => {
                                    setColumnTitleInput(e.target.value);
                                    if (e.target.value.trim()) setTitleError("");
                                }}
                                onBlur={() => handleColumnTitleBlur(col)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.target.blur();
                                    if (e.key === "Escape") {
                                        setEditingColId(null);
                                        setTitleError("");
                                    }
                                }}
                            />
                            {titleError && <span className="error-text">{titleError}</span>}
                        </div>
                    ) : (
                        <div className='column-header'>
                            <h3
                                draggable
                                onDragStart={(e) => onColumnDragStart(e, i)}
                            >
                                {col.title}
                            </h3>
                            <div className='column-tool'>
                                <ArrowRightCircle 
                                    className="edit-column-name-btn"
                                    size={20}
                                    style={{marginRight: '5px'}}
                                    onClick={() => onMoveList && onMoveList(col.id)}
                                    title="Di chuyển sang bảng khác"
                                />

                                <PenSquareIcon
                                    className="edit-column-name-btn"
                                    size={20}
                                    onClick={() => startEditColumn(col)}
                                />

                                <Archive
                                    className='store-column-btn'
                                    size={20}
                                    onClick={() => storeColumn(i)}
                                />
                            </div></div>
                    )}

                    <div className="card-list">
                        {col.cards.map((card, j) => (
                            <div
                                key={j}
                                className="card-item"
                                draggable
                                onDragStart={(e) => {
                                    e.stopPropagation();
                                    onDragStart(e, i, j);
                                }}
                                onDrop={(e) => {
                                    e.stopPropagation();
                                    if (e.dataTransfer.getData("type") === "column")
                                        onColumnDrop(e, i);
                                    else
                                        onDropBeforeCard(e, j, i)
                                }}
                                onDragOver={allowDrop}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={card.check} 
                                    onChange={(e) => {
                                        onToggleStatus(card.id, card.check);
                                    }} 
                                />
                                <div className="card-content-wrapper" onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                    
                                    {card.label && Array.isArray(card.label) && card.label.length > 0 && (
                                        <div className="card-tags">
                                            {card.label.map((labelIndex, idx) => {
                                                const color = boardLabelColors[labelIndex];
                                                if (!color) return null;
                                                return (
                                                    <span 
                                                        key={idx} 
                                                        className="card-tag-bar" 
                                                        style={{ backgroundColor: color }}
                                                    ></span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <p className="card-title-text">{card.title}</p>
                                </div>
                                
                                {card.check && (
                                    <div 
                                        title="Xóa thẻ"
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            onSoftDelete(card); 
                                        }}
                                        style={{ cursor: 'pointer', color: '#ef4444' }} 
                                    >
                                        <Trash2 size={20} />
                                    </div>
                                )}

                            </div>
                        ))}

                        {col.addCard ? (
                            <div className="add-card-container">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Thêm thẻ"
                                />
                                <button className="add-card blue" onClick={() => addCard(i)}>
                                    Thêm
                                </button>
                                <button className="add-card white" onClick={() => displayAddCard(i)}>
                                    Hủy
                                </button>
                            </div>
                        ) : (
                            <div
                                className="card-add"
                                onClick={() => displayAddCard(i)}
                            >
                                <p>+ Thêm thẻ</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {showAddColumn ?
                <div className="board-column">
                    <div className="add-column-container">
                        <input
                            value={newColumn}
                            onChange={(e) => setNewColumn(e.target.value)}
                            placeholder="Thêm tiêu đề"
                        />
                        <button className="add-card blue" onClick={addColumn}>
                            Thêm
                        </button>
                        <button className="add-card white" onClick={() => { setNewColumn(""); setShowAddColumn(false) }}>
                            Hủy
                        </button>
                    </div>
                </div> :
                <button className="add-column" onClick={() => setShowAddColumn(true)}>+ Thêm cột</button>}
        </div>
    );
};

export default ColumnMode;