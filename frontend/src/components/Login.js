import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Enter Phone Number, 2: Login, 3: Register
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0); // Track failed login attempts
  const navigate = useNavigate();

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/check_phone/', { phone_number: phoneNumber })
      .then(response => {
        if (response.data === "banned"){
            navigate('/banned');
          }
        if (response.data.exists) {
          setStep(2);  // Move to the login step
        } else {
          setStep(3);  // Move to the registration step
        }
      })
      .catch(() => {
        setError('Error checking phone number');
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/register/', { phone_number: phoneNumber, username, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/home');
      })
      .catch(error => {
        setError(error.response.data.error || 'An error occurred');
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginAttempts >= 3) {
      navigate('/banned');
      return;
    }

    axios.post('http://127.0.0.1:8000/login/', { phone_number: phoneNumber, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/home');
      })
      .catch(error => {
        setLoginAttempts(prevAttempts => prevAttempts + 1);
        if (loginAttempts >= 3) {
          navigate('/banned');
        } else {
          setError(error.response.data.error || 'An error occurred');
        }
      });
  };

  return (
    <div className='container'>
      <h1>{step === 1 ? 'شماره تلفنتو وارد کن' : step === 2 ? 'ورود' : 'ثبت نام'}</h1>
      <form onSubmit={step === 1 ? handlePhoneSubmit : (step === 2 ? handleLogin : handleRegister)}>
        {step === 1 && (
          <>
            <input 
              type="text" 
              placeholder="شماره تلفن" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
            />
            <button type="submit">بعدی</button>
          </>
        )}
        {(step === 2 || step === 3) && (
          <>
            {step === 3 && (
              <input 
                type="text" 
                placeholder="نام کاربری" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            )}
            <input 
              type="password" 
              placeholder="پسورد" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit">{step === 2 ? 'ورود' : 'ثبت نام'}</button>
          </>
        )}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
