import React from 'react';
import './BoardCard.css';
import { useNavigate } from 'react-router-dom';

export default function BoardCard({ title, color, add, showPopup }) {
    const navigate = useNavigate()
    const bg = color.includes(",") ? `linear-gradient(135deg, ${color})` : color

    return (
        <div className={`board-card ${add ? 'add-card' : ''}`} style={{ background: bg }} onClick={() => { if (title === "Create board") { showPopup() } else { navigate(`/boards/${title}?color=${encodeURIComponent(color)}`) } }}>
            <p>{title}</p>
            {add && <span>+</span>}
        </div>
    );
}
