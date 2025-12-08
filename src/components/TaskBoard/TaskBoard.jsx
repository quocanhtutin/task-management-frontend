import React, { useEffect, useState } from 'react'
import './TaskBoard.css'
import { Plus, ChevronDown } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import TableMode from '../TableMode/TableMode';
import ColumnMode from '../ColumnMode/ColumnMode';

const TaskBoard = ({
    setCardDetail,
    setShowCardDetailPopup,
    updateCardInColumn,
    columns,
    setColumns,
    addNewList,
    addCard,
    setShowSharePopup
}) => {

    const [cards, setCards] = useState([
        {
            id: null,
            title: null,
            column: null,
            label: null,
            members: [],
            deadline: null,
            checked: false,
            description: null,
            edit: false,
        }
    ])

    const { title } = useParams()
    const board_title = title
    const [searchParams] = useSearchParams()
    const rawColor = decodeURIComponent(searchParams.get("color"));
    const [color, setColor] = useState("");
    const [headerColor, setHeaderColor] = useState("")
    const [input, setInput] = useState('')
    const [viewMode, setViewMode] = useState('column')
    const [showViewMenu, setShowViewMenu] = useState(false)
    const [popupInfo, setPopupInfo] = useState(null)
    const [cardEdit, setCardEdit] = useState('')
    const [isStarred, setIsStarred] = useState(false);


    const displayAddCard = (col) => {
        setColumns(prev =>
            prev.map((cols, i) =>
                (i === col && (!input || (input && cols.addCard))) ? { ...cols, addCard: !cols.addCard } : { ...cols, addCard: false }
            )
        )
        setInput("")
    }



    const toggleViewMenu = () => setShowViewMenu(!showViewMenu);
    const selectView = (mode) => {
        setViewMode(mode);
        setShowViewMenu(false);
    };

    function darkenColor(hex, percent) {
        hex = hex.replace("#", "");

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        r = Math.floor(r * (1 - percent / 100));
        g = Math.floor(g * (1 - percent / 100));
        b = Math.floor(b * (1 - percent / 100));

        r = Math.max(0, r);
        g = Math.max(0, g);
        b = Math.max(0, b);

        const toHex = (v) => v.toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    useEffect(() => {
        const updatedColumns = columns.map(column => ({
            ...column,
            cards: column.cards.map(card => ({
                id: crypto.randomUUID(),
                title: card,
                column: column.title,
                label: null,
                members: [],
                deadline: null,
                check: false,
                description: false,
                edit: false,
            }))
        }));

        setColumns(updatedColumns);

        if (rawColor.includes(",")) {
            const baseColor = rawColor.split(",")[0];
            setHeaderColor(darkenColor(baseColor, 30));

            // gradient
            setColor(`linear-gradient(135deg, ${rawColor})`);
        } else {
            // màu đơn
            setHeaderColor(darkenColor(rawColor, 30));
            setColor(rawColor);
        }

    }, []);

    useEffect(() => {
        console.log(color)
    }, [])

    useEffect(() => {
        const allCards = columns.flatMap(column => column.cards);
        setCards(allCards);
    }, [columns]);

    const selectCardEdit = (card, cardIndex) => {
        if (cardEdit) return;
        const allCards = cards.map((card, i) => i === cardIndex ? { ...card, edit: true } : card)
        setCards(allCards)
        setCardEdit(card.title)
        console.log(cardEdit)
    }

    const updateCardEdit = (card, cardIndex) => {
        if (!cardEdit.trim()) return;
        const allCards = cards.map((c, i) => i === cardIndex ? { ...c, title: cardEdit, edit: false } : c)
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
        <div className="trello-board" style={{ background: color }}>
            <div className='board-header' style={{ background: headerColor }}>
                <div className='board-header-left'>
                    <h2>{board_title}</h2>
                    <div className="view-selector">
                        <button className="view-btn" onClick={toggleViewMenu}>
                            <ChevronDown size={16} />
                        </button>

                        {showViewMenu && (
                            <ul className="view-menu">
                                {['column', 'table'].map((mode) => (
                                    <li className={viewMode === mode ? "active-mode" : ""} key={mode} onClick={() => selectView(mode)}>{mode}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className='board-header-right'>
                    <div className="board-avatar">
                        QA
                    </div>
                    <button
                        className="star-btn"
                        onClick={() => setIsStarred(prev => !prev)}
                    >
                        {isStarred ? "★" : "☆"}
                    </button>
                    <button className="share-btn" onClick={() => setShowSharePopup(true)}>
                        + Chia sẻ
                    </button>
                </div>
            </div>

            {viewMode === 'column' && (
                <ColumnMode
                    columns={columns}
                    setColumns={setColumns}
                    input={input}
                    setInput={setInput}
                    displayAddCard={displayAddCard}
                    addCard={(col) => { addCard(col, input); setInput(""), displayAddCard(col) }}
                    setCardDetail={setCardDetail}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    updateCardInColumn={updateCardInColumn}
                    addNewList={addNewList}
                />
            )}


            {viewMode === 'table' && (
                <TableMode
                    cards={cards}
                    cardEdit={cardEdit}
                    setCardEdit={setCardEdit}
                    updateCardEdit={updateCardEdit}
                    columns={columns}
                    setColumns={setColumns}
                    setCardDetail={setCardDetail}
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    updateCardInColumn={updateCardInColumn}
                    addNewList={addNewList}
                    addCard={(col) => { addCard(col, input); setInput("") }}
                    input={input}
                    setInput={setInput}
                />
            )}

        </div>
    );
}

export default TaskBoard
