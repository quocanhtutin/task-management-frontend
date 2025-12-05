import React from 'react'
import './Planner.css'

const Planner = ({ onClose }) => {
    return (
        <div className="planner">
            <h2>Trình lập kế hoạch</h2>
            <p>Kết nối lịch của bạn để xem song song Trình lập kế hoạch và việc cần làm.</p>
            <button>Kết nối với một lịch</button>
            <div className="close-component" onClick={onClose}>X</div>
        </div>
    );
}

export default Planner
