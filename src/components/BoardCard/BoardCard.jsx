import React from 'react';
import './BoardCard.css';
import { useNavigate } from 'react-router-dom';

export default function BoardCard({ title, color, add, showPopup }) {
    const navigate = useNavigate()
    return (
        <div className={`board-card ${add ? 'add-card' : ''}`} style={{ backgroundColor: color }} onClick={() => { if (title === "Create board") { showPopup() } else { navigate(`/boards/${title}`) } }}>
            <p>{title}</p>
            {add && <span>+</span>}
        </div>
    );
}
