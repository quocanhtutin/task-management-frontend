import React, { useState } from 'react'
import './ManagementTable.css'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'
import { fillOffset } from 'framer-motion'

const ManagementTable = () => {
    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [cardDetail, setCardDetail] = useState(null)
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

    const boardWide = (!showInbox && !showPlanner) ? "full-board" : (!showInbox || !showPlanner) ? "wide-board" : "normal-board"

    return (
        <div className="man-table-container">
            {showCardDetailPopup && <CardDetailPopup card={cardDetail} onClose={() => setShowCardDetailPopup(false)} updateCardInColumn={updateCardInColumn} />}

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
