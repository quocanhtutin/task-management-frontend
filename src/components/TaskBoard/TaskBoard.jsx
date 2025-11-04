import React, { useEffect, useState } from 'react'
import './TaskBoard.css'
import { Plus, ChevronDown } from 'lucide-react';
import { useParams } from 'react-router-dom';

const TaskBoard = () => {

    const [columns, setColumns] = useState([
        { title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'], addCard: false },
        { title: 'Hôm nay', cards: [], addCard: false },
        { title: 'Tuần này', cards: [], addCard: false },
        { title: 'Sau này', cards: [], addCard: false },
    ]);

    const [cards, setCards] = useState([
        {
            card_id: null,
            card_title: null,
            card_column: null,
            card_label: null,
            card_member: [],
            card_deadline: null,
            card_check: false,
            card_edit: false
        }
    ])

    const { title } = useParams()
    const board_title = title
    const [input, setInput] = useState('');
    const [viewMode, setViewMode] = useState('column');
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [popupInfo, setPopupInfo] = useState(null);
    const [cardEdit, setCardEdit] = useState('')

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

    const moveCardToColumn = (toColIndex) => {
        if (!popupInfo) return;
        const { colIndex, cardIndex, fromTable } = popupInfo;

        if (fromTable) {
            const toColumn = columns[toColIndex].title;

            // Cập nhật trong mảng cards
            const updatedCards = cards.map((c, i) =>
                i === cardIndex ? { ...c, card_column: toColumn } : c
            );
            setCards(updatedCards);
            setPopupInfo(null);
            return;
        }

        // Cũ: di chuyển card giữa các cột khi view = column
        if (colIndex === toColIndex) {
            setPopupInfo(null);
            return;
        }

        const updated = [...columns];
        const [movedCard] = updated[colIndex].cards.splice(cardIndex, 1);
        updated[toColIndex].cards.push(movedCard);
        setColumns(updated);
        setPopupInfo(null);
    };


    const toggleViewMenu = () => setShowViewMenu(!showViewMenu);
    const selectView = (mode) => {
        setViewMode(mode);
        setShowViewMenu(false);
    };

    useEffect(() => {
        const allCards = columns.flatMap(column =>
            column.cards.map((card, i) => ({
                card_id: null,
                card_title: card,
                card_column: column.title,
                card_label: null,
                card_member: [],
                card_deadline: null,
                card_check: false,

            }))
        );

        setCards(allCards);
    }, [columns]);

    const selectCardEdit = (card, cardIndex) => {
        if (cardEdit) return;
        const allCards = cards.map((card, i) => i === cardIndex ? { ...card, card_edit: true } : card)
        setCards(allCards)
        setCardEdit(card.card_title)
        console.log(cardEdit)
    }

    const updateCardEdit = (card, cardIndex) => {
        if (!cardEdit.trim()) return;
        const allCards = cards.map((c, i) => i === cardIndex ? { ...c, card_title: cardEdit, card_edit: false } : c)
        setCards(allCards)
        setCardEdit("")
        console.log(cardEdit)
        console.log(cards)
    }

    const openMovePopup = (cardIndex, e) => {
        e.stopPropagation();
        const board = document.querySelector('.trello-board');
        const boardRect = board.getBoundingClientRect();
        const rect = e.currentTarget.getBoundingClientRect();

        let top = rect.bottom - boardRect.top + 4;
        let left = rect.left - boardRect.left;

        // Giới hạn popup không tràn ra ngoài vùng trello-board
        const popupWidth = 150;
        const popupHeight = 150;
        const maxLeft = boardRect.width - popupWidth - 10;
        const maxTop = boardRect.height - popupHeight - 10;

        if (left > maxLeft) left = maxLeft;
        if (top > maxTop) top = maxTop;

        setPopupInfo({
            cardIndex,
            top,
            left,
            fromTable: true,
        });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.move-popup-inline') && !e.target.closest('.column-selector')) {
                setPopupInfo(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);



    return (
        <div className="trello-board">
            <div className='board-header'>
                <h2>{board_title}</h2>
                <div className="view-selector">
                    <button className="view-btn" onClick={toggleViewMenu}>
                        <ChevronDown size={16} />
                    </button>

                    {showViewMenu && (
                        <ul className="view-menu">
                            {['column', 'table', 'grid'].map((mode) => (
                                <li className={viewMode === mode && "active-mode"} key={mode} onClick={() => selectView(mode)}>{mode}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {viewMode === 'column' && (
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
                                        <input type="radio" />
                                        <p>{card}</p>
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
            )}

            {viewMode === 'table' && (
                <div className='table-mode'>
                    <table className="table-view">
                        <thead>
                            <tr><th></th><th>Thẻ</th><th>Danh sách</th><th>Nhãn</th><th>Thành viên</th><th>Ngày hết hạn</th></tr>
                        </thead>
                        <tbody>
                            {cards.map((card, cardIndex) => (
                                <tr key={cardIndex}>
                                    <td>
                                        <input type='radio' />
                                    </td>
                                    <td >
                                        {!card.card_edit ?
                                            <div onClick={() => selectCardEdit(card, cardIndex)}>
                                                {card.card_title}
                                            </div>
                                            :
                                            <div className='edit-card'>
                                                <input type='text' value={cardEdit} onChange={(e) => setCardEdit(e.target.value)} />
                                                <button className="update-card" onClick={() => updateCardEdit(card, cardIndex)}>Lưu</button>
                                            </div>
                                        }
                                    </td>
                                    <td className="column-cell">
                                        <div className="column-selector" onClick={(e) => openMovePopup(cardIndex, e)}>
                                            <span>{card.card_column}</span>
                                            <ChevronDown size={14} className="down-icon" />
                                        </div>
                                        {popupInfo?.cardIndex === cardIndex && (
                                            <div
                                                className="move-popup-inline"
                                            >
                                                {columns.map((col, i) => (
                                                    <div
                                                        key={i}
                                                        className={`popup-item ${col.title === card.card_column ? 'active' : ''}`}
                                                        onClick={() => moveCardToColumn(i)}
                                                    >
                                                        {col.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </td>

                                    <td>
                                        {card.card_label || "."}
                                    </td>
                                    <td>
                                        {card.card_member != [] ? card.card_member : "."}
                                    </td>
                                    <td>
                                        {card.card_deadline || "."}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default TaskBoard
