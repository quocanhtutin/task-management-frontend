import React from 'react';
import './BoardCard.css';

export default function BoardCard({ title, color, add, onClick }) {
    
    const getBackgroundStyle = (bgString) => {
        if (!bgString) return { background: '#0079bf' };

        if (bgString.startsWith('http')) {
            return { 
                backgroundImage: `url(${bgString})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        
        if (bgString.includes(',')) {
            return { background: `linear-gradient(135deg, ${bgString})` };
        }

        return { background: bgString };
    };

    return (
        <div 
            className={`board-card ${add ? 'add-card' : ''}`} 
            style={getBackgroundStyle(color)} 
            onClick={onClick}
        >

            <p style={{position: 'relative', zIndex: 1}}>{title}</p>
            {add && <span style={{position: 'relative', zIndex: 1}}>+</span>}
        </div>
    );
}