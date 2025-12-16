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

    const navigate = useNavigate()

    const url = "https://workflow-0euv.onrender.com"


    const fetchWorkspaces = async () => {
        const response = await axios.get(url + "/");
    }


    useEffect(() => {
        async function loadData() {
            // await fetchWorkspaces()
            const savedAccessToken = localStorage.getItem("accessToken");
            if (savedAccessToken) {
                setAccessToken(savedAccessToken);
                setRefreshToken(localStorage.getItem("refreshToken"))
                setName(localStorage.getItem("name"));
                setEmail(localStorage.getItem("email"));
            }
            setIsLoaded(true);
        }
        loadData();
    }, [])

    useEffect(() => {
        if (accessToken && accessToken !== "") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
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

    const contextValue = {
        url,
        fetchWorkspaces,
        logout,
        setAccessToken,
        setRefreshToken,
        setEmail,
        setName
    }

    // if (!isLoaded) {
    //     return <div>Loading...</div>; // chờ localStorage load xong
    // }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider