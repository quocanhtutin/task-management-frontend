import React, { useState } from 'react'
import { ChevronDown, Archive } from 'lucide-react';
import './TableMode.css'


const TableMode = ({
    cards,
    setColumns,
    columns,
    setCardDetail,
    setShowCardDetailPopup,
    updateCardInColumn,
    addNewList,
    addCard,
    input,
    setInput
}) => {
    const [popupInfo, setPopupInfo] = useState(null);
    const [cardColumn, setCardColumn] = useState("")
    const [showAddCard, setShowAddCard] = useState(false)
    const [showColumns, setShowColumns] = useState(false)
    const [newColumn, setNewColumn] = useState(null)
    const [showAddColumn, setShowAddColumn] = useState("")


    const addColumn = () => {
        const title = newColumn;
        addNewList(title)
        setNewColumn("")
        setShowAddColumn(false)
        setCardColumn(title)
        setShowColumns(false)
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
                    {columns.map((col, i) => col.cards.map((card, cardIndex) => (
                        <tr key={cardIndex} className="table-row">
                            <td className="row-check">
                                <input type='checkbox' checked={card.check} onChange={(e) => updateCardInColumn(card.columnId, card.id, "check", e.target.checked)} />
                            </td>
                            <td className='card-detail' >
                                <div className='card-title' onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                    {card.title}
                                </div>
                                {card.check && <Archive className='store-btn' size={20} onClick={() => updateCardInColumn(card.column, card.id, "stored", true)} />}
                            </td>
                            <td onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                <p>{col.title}</p>
                            </td>

                            <td onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                {card.label ? <span className="labeled" style={{ background: card.label }} /> : "."}
                            </td>
                            <td onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                {card.members != [] ?
                                    card.members.map((m, idx) => (
                                        <div key={m.id} className={`avatar overlap idx-${idx}`} style={{ background: m.avatarColor }}>
                                            {m.name[0]}
                                        </div>
                                    )) :
                                    "."}
                            </td>
                            <td onClick={() => { setCardDetail(card), setShowCardDetailPopup(true) }}>
                                {card.deadline ? <p className="deadline">{new Date(card.deadline).toLocaleString()}</p> : "."}
                            </td>
                        </tr>
                    )))}
                </tbody>
            </table>
            {!showAddCard ?
                <button className="add-row" onClick={() => setShowAddCard(true)}>+<p>Thêm thẻ</p></button>
                :
                <div className="add-card-format">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Thêm thẻ"
                    />
                    <div className='select-column'>
                        <p className='selected-column'>
                            {cardColumn || "Thêm danh mục"}
                        </p>
                        <ChevronDown size={20} className="down-icon" onClick={() => setShowColumns(!showColumns)} />
                        {showColumns && (
                            <ul className="view-columns-tb">
                                {columns.map((col, i) => (
                                    <li key={i} onClick={() => { setCardColumn(col.id); setShowColumns(false) }}>{col.title}</li>
                                ))}
                                {!showAddColumn ?
                                    <li onClick={() => setShowAddColumn(true)}>+ Thêm danh sách</li>
                                    :
                                    <li className='new-list'>
                                        <input className='new-column' value={newColumn} onChange={(e) => setNewColumn(e.target.value)} />
                                        <button className="add-card blue" onClick={addColumn}>
                                            Thêm
                                        </button>
                                        <button className="add-card white" onClick={() => { setNewColumn(""); setShowAddColumn(false) }}>
                                            Hủy
                                        </button>
                                    </li>
                                }
                            </ul>
                        )}
                    </div>
                    <button className="add-card blue" onClick={() => {
                        const columnIndex = columns.findIndex(col => col.id === cardColumn);
                        addCard(columnIndex);
                        setShowAddCard(false);
                        setCardColumn("");
                        setShowColumns(false);
                    }}>
                        Thêm
                    </button>
                    <button className="add-card white" onClick={() => { setShowAddCard(false); setShowColumns(false); setCardColumn("") }}>
                        Hủy
                    </button>
                </div>
            }
        </div>
    )
}

export default TableMode
