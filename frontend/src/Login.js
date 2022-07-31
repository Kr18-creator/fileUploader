import './Login.css';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"

function Login() {
    const navigate =  useNavigate()
    const [loginData, setLoginData] = useState(
        localStorage.getItem('loginData')
            ? JSON.parse(localStorage.getItem('loginData'))
            : null
    );

    const handleLogin = async (googleData) => {
        axios.post('http://localhost:3000/api/google-login', {

            token: googleData
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(data => {
                const data1 = data.data
                setLoginData(data1);
                localStorage.setItem('loginData', JSON.stringify(data1));
                navigate('/fileUploader')
            }).catch(err => {
                console.log('err', err)
            })

    };
    const handleLogout = () => {
        localStorage.removeItem('loginData');
        setLoginData(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Hi, Login to File Uploader</h1>
                <div>
                    {loginData ? (
                        <div>
                            <h3>You logged in as {loginData.email}</h3>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                handleLogin(credentialResponse.credential)
                                console.log(credentialResponse);
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />

                    )}
                </div>
            </header>
        </div>
    );
}

export default Login;