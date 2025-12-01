import React, { useEffect, useState } from 'react'
import './TaskBoard.css'
import { Plus, ChevronDown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import TableMode from '../TableMode/TableMode';
import ColumnMode from '../ColumnMode/ColumnMode';

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
                <ColumnMode
                    columns={columns}
                    setColumns={setColumns}
                    input={input}
                    setInput={setInput}
                    displayAddCard={displayAddCard}
                    addCard={addCard}
                />
            )}


            {viewMode === 'table' && (
                <TableMode
                    cards={cards}
                    setCards={setCards}
                    selectCardEdit={selectCardEdit}
                    cardEdit={cardEdit}
                    setCardEdit={setCardEdit}
                    updateCardEdit={updateCardEdit}
                    columns={columns} />
            )}

        </div>
    );
}

export default TaskBoard
