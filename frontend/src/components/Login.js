import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [serverVerificationCode, setServerVerificationCode] = useState('');
  const navigate = useNavigate();

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/check_phone/', { phone_number: phoneNumber })
      .then(response => {
        if (response.data === "banned") {
          navigate('/banned');
        } else if (!response.data.exists) {
          setServerVerificationCode(response.data.verification_code);
          setStep(2);
        } else {
          setStep(4);
        }
      })
      .catch(() => {
        setError('ارور هنگام چک کردن شماره');
      });
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (enteredCode === serverVerificationCode) {
      setStep(4);
    } else {
      setError('کد اشتباهه دایی');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/register/', { phone_number: phoneNumber, username, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/');
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

    setIsDisabled(true);

    axios.post('http://127.0.0.1:8000/login/', { phone_number: phoneNumber, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      })
      .catch(error => {
        setLoginAttempts(prevAttempts => prevAttempts + 1);
        if (loginAttempts >= 3) {
          navigate('/banned');
        } else {
          setError(error.response.data.error || 'An error occurred');
        }
      })
      .finally(() => {
        setTimeout(() => setIsDisabled(false), 3000);
      });
  };

  return (
    <div className='container'>
      <h1>
        {step === 1 ? 'شماره تلفنتو وارد کن' : 
         step === 2 ? 'کد تاییدتو وارد کن' : 
         step === 3 ? 'ورود' : 'ثبت نام'}
      </h1>
      <form onSubmit={step === 1 ? handlePhoneSubmit : 
                           step === 2 ? handleCodeSubmit : 
                           step === 3 ? handleLogin : handleRegister}>
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
        {step === 2 && (
          <>
            <p>کد تأیید شما: {serverVerificationCode}</p>
            <input 
              type="text" 
              placeholder="کد تایید" 
              value={enteredCode} 
              onChange={(e) => setEnteredCode(e.target.value)} 
            />
            <button type="submit">بعدی</button>
          </>
        )}
        {(step === 3 || step === 4) && (
          <>
            {step === 4 && (
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
              disabled={isDisabled}
            />
            <button type="submit" disabled={isDisabled}>
              {step === 3 ? 'ورود' : 'ثبت نام'}
            </button>
          </>
        )}
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
