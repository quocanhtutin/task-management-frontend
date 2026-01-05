import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { Bell, Home, Plus, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosConfig';
import workspaceService from '../../services/workspaceService';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (keyword.trim()) {
        setIsLoading(true);
        try {
          const res = await workspaceService.getAll(keyword);
          
          const data = res.data.value || []; 
          setSearchResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Lỗi tìm kiếm:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const provider = localStorage.getItem('provider');
      await axiosClient.post('/Auth/Logout', {
        provider: provider,
        refreshToken: refreshToken
      });
    } catch (error) {
      console.error("Lỗi logout:", error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const handleResultClick = (workspace) => {
    console.log("Selected Workspace ID:", workspace.id);
    navigate('/home'); 
    setShowResults(false);
    setKeyword(''); 
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <button className="icon-btn" onClick={() => navigate('/home')}>
          <Home size={18} />
        </button>

        <div className="navbar-search-wrapper" ref={searchRef}>
          <div className="search-box">
             <Search size={16} className="search-icon-placeholder"/>
             <input 
               type="text" 
               placeholder="Tìm kiếm Workspace..." 
               className="search-input" 
               value={keyword}
               onChange={(e) => setKeyword(e.target.value)}
               onFocus={() => { if(keyword) setShowResults(true); }}
             />
          </div>

          {showResults && (
            <div className="search-results-dropdown">
              {isLoading ? (
                <div className="search-message">Đang tìm kiếm...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="search-header">Workspaces</div>
                  <ul className="search-list">
                    {searchResults.map((ws) => (
                      <li key={ws.id} onClick={() => handleResultClick(ws)}>
                        <div 
                          className="result-icon" 
                          style={{ backgroundColor: ws.background || '#0079bf' }}
                        >
                           {(ws.name || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className="result-info">
                          <span className="result-name">{ws.name}</span>
                          {ws.description && (
                            <span className="result-desc">{ws.description}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="search-message">Không tìm thấy kết quả</div>
              )}
            </div>
          )}
        </div>

      </div>
      
      <div className="navbar-right">
        <button className="icon-btn"><Plus /></button>
        <button className="icon-btn"><Bell /></button>
        <div className="menu-wrapper">
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}><User /></button>
          {showMenu && (
            <div className="navbar-dropdown-menu">
              <ul>
                <li onClick={() => handleNavigate('/main/settings')}>Tài khoản</li>
                <li>Cài đặt</li>
                <li>Chủ đề</li>
                <li>Trợ giúp</li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;