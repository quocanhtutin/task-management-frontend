import React, { useState } from 'react'
import './ManagementTable.css'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import SharingPopup from '../../components/SharingPopup/SharingPopup.jsx'

const ManagementTable = () => {
    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [cardDetail, setCardDetail] = useState(null)

    const [showSharePopup, setShowSharePopup] = useState(false);

    const [columns, setColumns] = useState([
        { title: 'Hướng dẫn', cards: ['Bắt đầu sử dụng Trello', 'Học cách dùng Trello'], addCard: false },
        { title: 'Hôm nay', cards: [], addCard: false },
        { title: 'Tuần này', cards: [], addCard: false },
        { title: 'Sau này', cards: [], addCard: false },
    ]);
    const [showInbox, setShowInbox] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);

    const updateCardInColumn = (columnTitle, cardId, field, value) => {
        setColumns(prev =>
            prev.map(col =>
                col.title === columnTitle
                    ? {
                        ...col,
                        cards: col.cards.map(card =>
                            card.id === cardId
                                ? { ...card, [field]: value }
                                : card
                        )
                    }
                    : col
            )
        );
        console.log(field, value)
    };

    const addNewList = (listTitle) => {
        if (listTitle) setColumns([...columns, { title: listTitle, cards: [] }]);
    }

    const addCard = (col, cardTitle) => {
        if (cardTitle.trim()) {
            const updated = [...columns];
            updated[col].cards.push({
                id: crypto.randomUUID(),
                title: cardTitle,
                column: updated[col].title,
                label: null,
                members: [],
                deadline: null,
                check: false,
                description: null,
                edit: false,
            });
            setColumns(updated);
        }
    }

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    return (
        <div className="man-table-container">
            {showCardDetailPopup && <CardDetailPopup card={cardDetail} onClose={() => setShowCardDetailPopup(false)} updateCardInColumn={updateCardInColumn} columns={columns} setColumns={setColumns} />}
            {showSharePopup && <SharingPopup onClose={() => setShowSharePopup(false)} />}

            <div className={`main-content ${boardWide}`}>
                {showInbox && (
                    <Inbox onClose={() => setShowInbox(false)} />
                )}

                {showPlanner && (
                    <Planner onClose={() => setShowPlanner(false)} />
                )}

                <TaskBoard
                    setShowCardDetailPopup={setShowCardDetailPopup}
                    setCardDetail={setCardDetail}
                    updateCardInColumn={updateCardInColumn}
                    columns={columns}
                    setColumns={setColumns}
                    addNewList={addNewList}
                    addCard={addCard}
                    setShowSharePopup={setShowSharePopup}
                />
            </div>

            <div className="toggle-floating-panel">
                {!showInbox && (
                    <div className="toggle-icon" onClick={() => setShowInbox(true)}>
                        Inbox
                    </div>
                )}
                {!showPlanner && (
                    <div className="toggle-icon" onClick={() => setShowPlanner(true)}>
                        Planner
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManagementTable
