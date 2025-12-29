import React, { useEffect, useState } from 'react'
import './TaskBoard.css'
import { Plus, ChevronDown, EllipsisVertical } from 'lucide-react';
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
    setShowSharePopup,
    setShowMenuBoardPopup,
    rawColor,
    isStarred,
    setIsStarred,
    cards,
    setCards,
    storeCard,
    storeColumn,
    updateTitleColumn,
    handleDragEnd
}) => {


    const { title } = useParams()
    const board_title = title
    const [color, setColor] = useState("");
    const [headerColor, setHeaderColor] = useState("")
    const [input, setInput] = useState("")
    const [viewMode, setViewMode] = useState('column')
    const [showViewMenu, setShowViewMenu] = useState(false)



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
        if (rawColor.includes(",")) {
            const baseColor = rawColor.split(",")[0];
            setHeaderColor(darkenColor(baseColor, 30));

            setColor(`linear-gradient(135deg, ${rawColor})`);
        } else {
            setHeaderColor(darkenColor(rawColor, 30));
            setColor(rawColor);
        }
    }, [rawColor])

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
                    <button className='menu-board' onClick={() => setShowMenuBoardPopup(true)}>
                        <EllipsisVertical />
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
                    storeCard={storeCard}
                    storeColumn={storeColumn}
                    updateTitleColumn={updateTitleColumn}
                    handleDragEnd={handleDragEnd}
                />
            )}


            {viewMode === 'table' && (
                <TableMode
                    cards={cards}
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
