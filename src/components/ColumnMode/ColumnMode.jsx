import React, { useEffect, useState } from 'react'
import './ColumnMode.css'
import { Plus } from 'lucide-react'

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
    addNewList
}) => {

    const [showAddColumn, setShowAddColumn] = useState(false)
    const [newColumn, setNewColumn] = useState("")

    const onDragStart = (e, fromCol, fromIndex) => {
        e.dataTransfer.setData('fromCol', fromCol);
        e.dataTransfer.setData('fromIndex', fromIndex);
    };

    const allowDrop = (e) => e.preventDefault();

    const onDrop = (e, toCol) => {
        const fromCol = e.dataTransfer.getData('fromCol');
        const fromIndex = e.dataTransfer.getData('fromIndex');

        if (fromCol === '' || fromIndex === '') return;

        const updated = [...columns];
        const [movedCard] = updated[fromCol].cards.splice(fromIndex, 1);
        updated[toCol].cards.push({ ...movedCard, column: updated[toCol].title });

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
                    onDrop={(e) => onDrop(e, i)}
                    onDragOver={allowDrop}
                >
                    <h3>{col.title}</h3>

                    <div className="card-list">
                        {col.cards.map((card, j) => (
                            <div
                                key={j}
                                className="card-item"
                                draggable
                                onDragStart={(e) => onDragStart(e, i, j)}
                                style={card.label ? { backgroundColor: card.label, color: "white" } : { background: "white" }}
                            >
                                <input type="checkbox" checked={card.check} onChange={(e) => updateCardInColumn(col.title, card.id, "check", e.target.checked)} />
                                <p onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>{card.title}</p>
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
