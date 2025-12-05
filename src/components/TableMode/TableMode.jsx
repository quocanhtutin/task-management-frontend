import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react';
import './TableMode.css'


const TableMode = ({ cards, setCards, selectCardEdit, setColumns, cardEdit, setCardEdit, updateCardEdit, columns, setCardDetail, setShowCardDetailPopup }) => {
    const [popupInfo, setPopupInfo] = useState(null);
    const moveCardToColumn = (toColIndex) => {
        if (!popupInfo) return;
        const { colIndex, cardIndex, fromTable } = popupInfo;

        if (fromTable) {
            const toColumn = columns[toColIndex].title;

            // Cập nhật trong mảng cards
            const updatedCards = cards.map((c, i) =>
                i === cardIndex ? { ...c, column: toColumn } : c
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
                <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "35%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                    <tr><th></th><th>Thẻ</th><th>Danh sách</th><th>Nhãn</th><th>Thành viên</th><th>Ngày hết hạn</th></tr>
                </thead>
                <tbody>
                    {cards.map((card, cardIndex) => (
                        <tr key={cardIndex}>
                            <td>
                                <input type='checkbox' checked={card.check} />
                            </td>
                            <td >
                                {!card.edit ?
                                    <div onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                        {card.title}
                                    </div>
                                    :
                                    <div className='edit-card'>
                                        <input type='text' value={cardEdit} onChange={(e) => setCardEdit(e.target.value)} />
                                        <button className="update-card" onClick={() => updateCardEdit(card, cardIndex)}>Lưu</button>
                                    </div>
                                }
                            </td>
                            <td>
                                <div className="column-selector" onClick={(e) => setPopupInfo(cardIndex)}>
                                    <p>{card.column}</p>
                                    <ChevronDown size={14} className="down-icon" />
                                </div>
                            </td>

                            <td>
                                {card.label ? <span className="labeled" style={{ background: card.label }} /> : "."}
                            </td>
                            <td>
                                {card.member != [] ? card.member : "."}
                            </td>
                            <td>
                                {card.deadline || "."}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TableMode
