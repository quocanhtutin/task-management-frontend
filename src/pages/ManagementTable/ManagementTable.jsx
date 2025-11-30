import React, { useState } from 'react'
import './ManagementTable.css'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'
import CardDetailPopup from '../../components/CardDetailPopup/CardDetailPopup.jsx'

const ManagementTable = () => {
    const [showCardDetailPopup, setShowCardDetailPopup] = useState(false)
    const [carrDetail, setCardDetail] = useState(null)
    return (
        <div className="man-table-container">
            {showCardDetailPopup && <CardDetailPopup card={carrDetail} onClose={() => setShowCardDetailPopup(false)} />}
            <div className="main-content">
                <Inbox />
                <Planner />
                <TaskBoard setShowCardDetailPopup={setShowCardDetailPopup} setCardDetail={setCardDetail} />
            </div>
        </div>
    )
}

export default ManagementTable
