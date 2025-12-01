import React, { useEffect } from 'react'
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
    setShowCardDetailPopup
}) => {

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
        const title = prompt('Tên cột mới:');
        if (title) setColumns([...columns, { title, cards: [] }]);
    };

    useEffect(() => {
        console.log(columns)
    }, [columns])

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

                            >
                                <input type="radio" />
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
                                <Plus /> <p>Thêm thẻ</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button className="add-column" onClick={addColumn}>+ Thêm cột</button>
        </div>
    );
};

export default ColumnMode;
