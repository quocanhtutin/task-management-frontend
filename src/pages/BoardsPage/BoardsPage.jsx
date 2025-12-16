import React, { useState, useContext, useEffect } from 'react';
import WorkspaceHeader from '../../components/WorkspaceHeader/WorkspaceHeader.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import { useNavigate } from 'react-router-dom';
import './BoardsPage.css';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';
import { StoreContext } from '../../context/StoreContext.jsx';
import axios from 'axios';

export default function BoardsPage() {
    const { currentWorkSpace, accessToken, url } = useContext(StoreContext)

    const [boards, setBoards] = useState([])

    const fetchBoards = async () => {
        try {
            const response = await axios.get(url + "/Board", {
                params: {
                    WorkspaceId: currentWorkSpace.id
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            if (response.data.isSuccess) {
                setBoards(response.data.value)
            }
        } catch (error) {
            console.error("Fetch board error:", error.response?.status);
        }
    }

    useEffect(() => {
        if (currentWorkSpace?.id && accessToken) {
            fetchBoards();
        }
    }, [currentWorkSpace, accessToken]);




    const [showCreateBoardPopup, setShowCreateBoardPopup] = useState(false)

    const addNewBoard = async (title, color, visibility) => {
        try {
            if (title && color && visibility) {
                const response = await axios.post(url + "/Board/Create",
                    {
                        board: {
                            workspaceId: currentWorkSpace.id,
                            title: title,
                            background: color,
                            visibility: visibility
                        }
                    }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
                )
                if (response.data.isSuccess) {
                    fetchBoards()
                }
            }
        } catch (error) {
            console.error("Create board error:", error.response?.status);
        }
    }

    return (
        <div className="boards-page">
            {showCreateBoardPopup && <CreateBoardPopup onClose={() => setShowCreateBoardPopup(false)} addNewBoard={addNewBoard} />}
            <WorkspaceHeader />

            <div className="user-boards">
                <h3>Các bảng của bạn</h3>
                <div className="user-board-cards">
                    {boards.map((t, i) => t.background && (
                        <BoardCard key={i} title={t.title} color={t.background} />
                    ))}
                    <BoardCard title="Create board" add color="#E2E4E6" showPopup={() => setShowCreateBoardPopup(true)} />
                </div>
            </div>
        </div>
    );
}
