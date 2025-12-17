import React, { useState, useContext, useEffect } from 'react';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import { useNavigate } from 'react-router-dom';
import './BoardsPage.css';
import CreateBoardPopup from '../../components/CreateBoardPopup/CreateBoardPopup.jsx';
import { StoreContext } from '../../context/StoreContext.jsx';
import axios from 'axios';

export default function BoardsPage() {
    const { currentWorkSpace, accessToken, url } = useContext(StoreContext)

    const [boards, setBoards] = useState([])
    const [searchText, setSearchText] = useState('');

    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchText.toLowerCase())
    );

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
            <div className="workspace-header-01">
                <div className="workspace-info">
                    <div className="workspace-icon">
                        {currentWorkSpace.name.charAt(0)}
                    </div>
                    <div>
                        <h2>{currentWorkSpace.name}</h2>
                        <p>{currentWorkSpace.description}</p>
                    </div>
                </div>

                <div className="board-search">
                    <p>Tìm kiếm bảng</p>
                    <input
                        type="text"
                        placeholder="Tên bảng..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <div className="user-boards">
                <h3>Các bảng của bạn</h3>
                <div className="user-board-cards">
                    {filteredBoards.map((t, i) => t.background && (
                        <BoardCard key={i} title={t.title} color={t.background} />
                    ))}
                    <BoardCard title="Create board" add color="#E2E4E6" showPopup={() => setShowCreateBoardPopup(true)} />
                </div>
            </div>
        </div>
    );
}
