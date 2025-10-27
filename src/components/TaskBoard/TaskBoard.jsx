import React, { useState } from 'react'
import './TaskBoard.css'
import { Plus } from 'lucide-react';

const TaskBoard = () => {

    const [columns, setColumns] = useState([
        { title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'], addCard: false },
        { title: 'Hôm nay', cards: [], addCard: false },
        { title: 'Tuần này', cards: [], addCard: false },
        { title: 'Sau này', cards: [], addCard: false },
    ]);

    const [input, setInput] = useState('');

    const addColumn = () => {
        const title = prompt('Tên cột mới:');
        if (title) setColumns([...columns, { title, cards: [], addCard: false }]);
    };

    const displayAddCard = (col) => {
        setColumns(prev =>
            prev.map((cols, i) =>
                (i === col && (!input || (input && cols.addCard))) ? { ...cols, addCard: !cols.addCard } : { ...cols, addCard: false }
            )
        )
        setInput("")
    }

    const addCard = (col) => {
        if (input.trim()) {
            const updated = [...columns];
            updated[col].cards.push(input);
            setColumns(updated);
            displayAddCard(col)
            setInput('')
        }
    }

    const onDragStart = (e, fromCol, fromIndex) => {
        e.dataTransfer.setData('fromCol', fromCol);
        e.dataTransfer.setData('fromIndex', fromIndex);
    };


    const onDrop = (e, toCol) => {
        const fromCol = e.dataTransfer.getData('fromCol');
        const fromIndex = e.dataTransfer.getData('fromIndex');


        if (fromCol === '' || fromIndex === '') return;

        const updated = [...columns];
        const [movedCard] = updated[fromCol].cards.splice(fromIndex, 1);
        updated[toCol].cards.push(movedCard);
        setColumns(updated);
    };


    const allowDrop = (e) => e.preventDefault();


    return (
        <div className="trello-board">
            <div className="board-scroll">
                {columns.map((col, i) => (
                    <div key={i} className="board-column" onDrop={(e) => onDrop(e, i)} onDragOver={allowDrop}>
                        <h3>{col.title}</h3>
                        <div className="card-list">
                            {col.cards.map((card, j) => (
                                <div
                                    key={j}
                                    className="card-item"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, i, j)}
                                >
                                    {card}
                                </div>
                            ))}
                            {col.addCard ?
                                <div className="add-card-container">
                                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Thêm thẻ" />
                                    <button className="add-card blue" onClick={() => addCard(i)}>Thêm</button>
                                    <button className="add-card white" onClick={() => displayAddCard(i)}>Hủy</button>
                                </div>
                                :
                                <div className='card-add' onClick={() => displayAddCard(i)}>
                                    <Plus /> <p>Thêm thẻ</p>
                                </div>
                            }
                        </div>
                    </div>
                ))}
                <button className="add-column" onClick={addColumn}>+ Thêm cột</button>
            </div>
        </div>
    );
}

export default TaskBoard
