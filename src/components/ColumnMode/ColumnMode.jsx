import React, { useEffect, useState } from 'react'
import './ColumnMode.css'
import { Archive, PenSquareIcon } from 'lucide-react'

const ColumnMode = ({
    columns,
    setColumns,
    input,
    setInput,
    displayAddCard,
    addCard,
    setCardDetail,
    setShowCardDetailPopup,
    updateCardInColumn,
    addNewList,
    storeCard,
    storeColumn,
    updateTitleColumn
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

        // gọi hàm cha (bạn tự implement trong parent)
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

    const onDrop = (e, toCol) => {
        const type = e.dataTransfer.getData("type");
        if (type !== "card") return; //không phải card bỏ qua
        const fromCol = e.dataTransfer.getData('fromCol');
        const fromIndex = e.dataTransfer.getData('fromIndex');

        if (fromCol === '' || fromIndex === '') return;

        const updated = [...columns];
        const [movedCard] = updated[fromCol].cards.splice(fromIndex, 1);
        updated[toCol].cards.push({ ...movedCard, columnId: updated[toCol].id });

        setColumns(updated);
    };

    const onDropBeforeCard = (e, beforeCard, atCol) => {
        e.preventDefault();
        e.stopPropagation();  // NGĂN column.onDrop chạy
        const fromCol = e.dataTransfer.getData('fromCol');
        const fromIndex = e.dataTransfer.getData('fromIndex');

        if (fromCol === '' || fromIndex === '') return;

        const updated = [...columns];
        const [movedCard] = updated[fromCol].cards.splice(fromIndex, 1);
        updated[atCol].cards.splice(beforeCard, 0, { ...movedCard, columnId: updated[atCol].id });
        setColumns(updated);
    };

    const onColumnDrop = (e, targetColIndex) => {
        const type = e.dataTransfer.getData("type")
        if (type !== "column") return   // Không phải column → bỏ qua

        const fromIndex = e.dataTransfer.getData("colIndex")
        if (fromIndex === targetColIndex) return

        const updated = [...columns]
        const [movedCol] = updated.splice(fromIndex, 1)
        updated.splice(targetColIndex, 0, movedCol)

        setColumns(updated);
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
                    // onDrop={(e) => onDrop(e, i)}
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
                                    e.stopPropagation();   // Quan trọng, chặn bubble
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
                            // style={card.label != [] ? { backgroundColor: card.label[0], color: "white" } : { background: "white" }}
                            >
                                <input type="checkbox" checked={card.check} onChange={(e) => updateCardInColumn(col.id, card.id, "check", e.target.checked)} />
                                <p onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>{card.title}</p>
                                {card.check && <Archive size={20} onClick={() =>
                                    // updateCardInColumn(col.title, card.id, "stored", true)
                                    storeCard(card)}
                                />}

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