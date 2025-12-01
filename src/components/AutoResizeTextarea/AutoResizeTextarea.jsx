import { useEffect, useRef } from "react";
import './AutoResizeTextarea.css'

const AutoResizeTextarea = ({ value, onChange, onFocus }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            className="auto-textarea"
            onFocus={() => onFocus()}
        ></textarea>
    );
};

export default AutoResizeTextarea;
