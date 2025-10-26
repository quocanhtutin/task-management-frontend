import React, { useState } from 'react'
import './Inbox.css'

const Inbox = () => {
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState('');


    const addTag = () => {
        if (input.trim()) {
            setTags([...tags, input]);
            setInput('');
        }
    };


    return (
        <div className="inbox">
            <h2>Hộp thư đến</h2>
            <div className="add-tag">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Thêm thẻ" />
                <button onClick={addTag}>Thêm</button>
            </div>
            <div className="tag-list">
                {tags.map((tag, i) => (
                    <div key={i} className="tag-item">{tag}</div>
                ))}
            </div>
        </div>
    );
}

export default Inbox
