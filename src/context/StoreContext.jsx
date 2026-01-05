import axios from "axios";
import { createContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [accessToken, setAccessToken] = useState("")
    const [refreshToken, setRefreshToken] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [isLoaded, setIsLoaded] = useState(false);
    const [workSpaces, setWorkSpaces] = useState([])
    const [currentWorkSpace, setCurrentWorkSpace] = useState({})

    const navigate = useNavigate()

    const url = "https://workflow-0euv.onrender.com"

    const getLocal = (key) => {
        const v = localStorage.getItem(key);
        if (!v) return null;
        const low = String(v).toLowerCase();
        if (low === 'null' || low === 'undefined') return null;
        return v;
    };

    useEffect(() => {
        async function loadData() {
            const savedAccessToken = getLocal("accessToken");
            if (savedAccessToken) {
                setAccessToken(savedAccessToken);
                setRefreshToken(getLocal("refreshToken") || "");
                setName(getLocal("name") || "");
                setEmail(getLocal("email") || "");
            }
            const savedWorkspace = getLocal("currentWorkspace");
            if (savedWorkspace) {
                try {
                    setCurrentWorkSpace(JSON.parse(savedWorkspace));
                } catch (e) {
                    setCurrentWorkSpace({});
                }
            }
            setIsLoaded(true);
        }
        loadData();
    }, [])

    useEffect(() => {
        if (accessToken && accessToken !== "") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken || "");
            localStorage.setItem("email", email || "");
            localStorage.setItem("name", name || "");
        } else if (!accessToken) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
        }
    }, [accessToken, refreshToken, name, email]);

    const logout = () => {
        setAccessToken("")
        setRefreshToken("")
        setEmail("")
        setName("")
        localStorage.clear();
        navigate('/')
    };

    const selectWorkspace = (ws) => {
        setCurrentWorkSpace(ws);
        localStorage.setItem("currentWorkspace", JSON.stringify(ws));
    };

    useEffect(() => {
        const savedWorkspace = localStorage.getItem("currentWorkspace");
        if (savedWorkspace) {
            setCurrentWorkSpace(JSON.parse(savedWorkspace));
        }
    }, []);


    const contextValue = {
        url,
        logout,
        setAccessToken,
        setRefreshToken,
        setEmail,
        setName,
        workSpaces,
        setWorkSpaces,
        accessToken,
        currentWorkSpace,
        setCurrentWorkSpace,
        selectWorkspace,
        isLoaded
    }

    // if (!isLoaded) {
    //     return <div>Loading...</div>;
    // }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider