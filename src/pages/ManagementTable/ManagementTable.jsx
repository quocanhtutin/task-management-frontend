import React from 'react'
import './ManagementTable.css'
import Inbox from '../../components/Inbox/Inbox.jsx'
import Navbar from '../../components/Navbar/Navbar.jsx'
import Planner from '../../components/Planner/Planner.jsx'
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx'

const ManagementTable = () => {
    return (
        <div className="man-table-container">
            <Navbar />
            <div className="main-content">
                <Inbox />
                <Planner />
                <TaskBoard />
            </div>
        </div>
    )
}

export default ManagementTable
