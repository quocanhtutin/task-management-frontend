import React, { useState } from 'react'
import './TaskBoard.css'

const TaskBoard = () => {
    const [columns, setColumns] = useState([
        { title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'] },
        { title: 'Hôm nay', cards: [] },
        { title: 'Tuần này', cards: [] },
        { title: 'Sau này', cards: [] },
    ]);


    const addColumn = () => {
        const title = prompt('Tên cột mới:');
        if (title) setColumns([...columns, { title, cards: [] }]);
    };


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
                        </div>
                    </div>
                ))}
                <button className="add-column" onClick={addColumn}>+ Thêm cột</button>
            </div>
        </div>
    );
}

export default TaskBoard
