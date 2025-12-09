import React from 'react'
import './Planner.css'
import { X } from "lucide-react";

const Planner = ({ onClose }) => {
    return (
        <div className="planner">
            <h2>Trình lập kế hoạch</h2>
            <p>Kết nối lịch của bạn để xem song song Trình lập kế hoạch và việc cần làm.</p>
            <button>Kết nối với một lịch</button>
            <X size={20} className='close-component' onClick={onClose} />
        </div>
    );
}

export default Planner
