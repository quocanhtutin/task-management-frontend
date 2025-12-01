import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react';
import './TableMode.css'


const TableMode = ({ cards, setCards, selectCardEdit, cardEdit, setCardEdit, updateCardEdit, columns }) => {
    const [popupInfo, setPopupInfo] = useState(null);
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

    return (
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
    )
}

export default TableMode
