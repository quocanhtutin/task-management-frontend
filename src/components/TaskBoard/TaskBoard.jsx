import React, { useEffect, useState } from 'react'
import './TaskBoard.css'
import { Plus, ChevronDown, EllipsisVertical, Users } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import TableMode from '../TableMode/TableMode';
import ColumnMode from '../ColumnMode/ColumnMode';
import BoardMembersModal from '../BoardMembersModal/BoardMembersModal.jsx';

const TaskBoard = ({
    setCardDetail,
    setShowCardDetailPopup,
    updateCardInColumn,
    columns,
    setColumns,
    addNewList,
    addCard,
    onToggleStatus,
    setShowSharePopup,
    setShowMenuBoardPopup,
    rawColor,
    isStarred,
    onTogglePinned,
    cards,
    setCards,
    storeCard,
    onSoftDelete,
    storeColumn,
    updateTitleColumn,
    boardId,
    boardTitle,
    boardLabelColors,
    handleDragEnd,
    onMoveList,
    ownerName,
    ownerAvatar,
    onCloneList
}) => {


    const { title } = useParams()
    const board_title = boardTitle || title
    const [color, setColor] = useState("");
    const [headerColor, setHeaderColor] = useState("")
    const [input, setInput] = useState("")
    const [viewMode, setViewMode] = useState('column')
    const [showViewMenu, setShowViewMenu] = useState(false)
    const [showMembersModal, setShowMembersModal] = useState(false)



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

    const getBackgroundStyle = (bgString) => {
        const style = {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };

        if (!bgString) return { ...style, backgroundColor: "#0079bf" };

        if (bgString.startsWith('http')) {
            return { ...style, backgroundImage: `url(${bgString})` };
        }

        if (bgString.includes(',')) {
            return { ...style, backgroundImage: `linear-gradient(135deg, ${bgString})` };
        }

        return { backgroundColor: bgString };
    };

    const getDominantColorFromImage = (imageUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = "Anonymous"
            img.src = imageUrl

            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")

                const w = 40
                const h = 40
                canvas.width = w
                canvas.height = h

                ctx.drawImage(img, 0, 0, w, h)

                const data = ctx.getImageData(0, 0, w, h).data

                let r = 0, g = 0, b = 0, count = 0
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i]
                    g += data[i + 1]
                    b += data[i + 2]
                    count++
                }

                r = Math.round(r / count)
                g = Math.round(g / count)
                b = Math.round(b / count)

                resolve(`rgb(${r}, ${g}, ${b})`)
            }

            img.onerror = reject
        })
    }

    const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g)
        if (!result) return "#000000"

        const toHex = (n) => Number(n).toString(16).padStart(2, "0")
        return `#${toHex(result[0])}${toHex(result[1])}${toHex(result[2])}`
    }


    useEffect(() => {
        if (!rawColor) return;

        if (rawColor.includes(",")) {
            const baseColor = rawColor.split(",")[0]
            setHeaderColor(darkenColor(baseColor, 30))
            setColor(`linear-gradient(135deg, ${rawColor})`)
            return
        }

        if (rawColor.startsWith("http")) {
            getDominantColorFromImage(rawColor)
                .then(color => {
                    setHeaderColor(darkenColor(rgbToHex(color), 35))
                })
                .catch(() => setHeaderColor("#172b4d"))
            return
        }

        setHeaderColor(darkenColor(rawColor, 30))
        setColor(rawColor)
    }, [rawColor])

    return (
        <div className="trello-board" style={getBackgroundStyle(rawColor)}>
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
                    <div
                        className="board-avatar"
                        title={`Chủ sở hữu: ${ownerName}`}
                        style={{
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'default'
                        }}
                    >
                        {ownerAvatar ? (
                            <img
                                src={ownerAvatar}
                                alt={ownerName}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <span>{ownerName ? ownerName[0].toUpperCase() : "?"}</span>
                        )}
                    </div>
                    <button
                        className="star-btn"
                        onClick={onTogglePinned}
                    >
                        {isStarred ? "★" : "☆"}
                    </button>
                    <button className="share-btn" onClick={() => setShowSharePopup(true)}>
                        + Chia sẻ
                    </button>
                    <button className="share-btn" onClick={() => setShowMembersModal(true)} >
                        <Users size={14} /> Thành viên
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
                    onMoveList={onMoveList}
                    onSoftDelete={onSoftDelete}
                    boardLabelColors={boardLabelColors}
                    onToggleStatus={onToggleStatus}
                    onCloneList={onCloneList}
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
                    onToggleStatus={onToggleStatus}
                />
            )}

            {showMembersModal && (
                <BoardMembersModal boardId={boardId} boardName={board_title} onClose={() => setShowMembersModal(false)} />
            )}

        </div>
    );
}

export default TaskBoard
