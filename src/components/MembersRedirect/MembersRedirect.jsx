import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext.jsx';

export default function MembersRedirect() {
    const { currentWorkSpace } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentWorkSpace && currentWorkSpace.name) {
            navigate(`/workspace/${currentWorkSpace.name}/members`, { replace: true });
        } else {
            navigate('/main/boards', { replace: true });
        }
    }, [currentWorkSpace, navigate]);

    return null;
}