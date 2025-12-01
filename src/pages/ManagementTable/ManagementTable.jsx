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
    return (
        <div className="man-table-container">
            {showCardDetailPopup && <CardDetailPopup card={cardDetail} onClose={() => setShowCardDetailPopup(false)} updateCardInColumn={updateCardInColumn} />}
            <div className="main-content">
                <Inbox />
                <Planner />
                <TaskBoard setShowCardDetailPopup={setShowCardDetailPopup} setCardDetail={setCardDetail} updateCardInColumn={updateCardInColumn} columns={columns} setColumns={setColumns} />
            </div>
        </div>
    )
}

export default ManagementTable
