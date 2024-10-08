import React, { createContext, useState, useContext } from 'react'; // Add useContext import
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const apiUrl = process.env.REACT_APP_API_URL;

    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);

// This is updated - you're specifically decoding the access token to get the user info
    const [user, setUser] = useState(() => {
    const tokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;
    const token = tokens ? tokens.access : null;
    return token ? jwt_decode(token) : null;
});
    const navigate = useNavigate();

    const loginUser = async (payload) => {
        try {
            let response = await fetch(`${apiUrl}/admin-token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (response.status === 200) {
                let data = await response.json();
                setAuthTokens(data);
                localStorage.setItem('authTokens', JSON.stringify(data));
    
                // Fetch the user's role from the new API endpoint
                const roleResponse = await fetch(`${apiUrl}/get-user-role/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.access}`, // Include the JWT
                    },
                });
    
                if (roleResponse.status === 200) {
                    const roleData = await roleResponse.json();
                    setUser({ ...jwt_decode(data.access), role: roleData.role });
                    navigate('/dashboard');
                } else {
                    alert("Failed to fetch user role");
                }
            } else if (response.status === 403) {
                alert("You do not have permission to access the dashboard");
            } else {
                let data = await response.json();
                alert(data.detail ? data.detail : "Error, incorrect password?");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/dashboard');
    }


    let contextData = {
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
        authTokens: authTokens,
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
