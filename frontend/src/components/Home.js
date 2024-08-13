import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';
const Home = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Token ${token}` } : {};
    

    axios.get('http://127.0.0.1:8000/home/', { headers })
      .then(response => {
        console.log(response)
        if (response.data.banned) {
          navigate('/banned');
        } else {
          setData(response.data);
        }
      })
      .catch(error => {
        console.error('An error occurred', error);
        setData({
          authenticated: false,
          banned: false,
          message: 'An error occurred while fetching data'
        });
      });
  }, [navigate]);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Token ${token}` } : {};

    axios.post('http://127.0.0.1:8000/logout/', {}, { headers })
      .then(response => {
        localStorage.removeItem('token');
        navigate('/login');
      })
      .catch(error => {
        console.error('Error during logout', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
  };

  if (data === null) {
    return <div>لودینگ...</div>;
  }

  return (
    <div className='container'>
      <h1 className='animated-text'>صفحه خانه</h1>
      {data.authenticated ? (
        <div>
          <h3>سلام {data.username}</h3>
          <button onClick={handleLogout}>خروج</button>
        </div>
      ) : (
        <div>
          <h3>شما لاگین نکردی ! برو لاگین کن</h3>
          <button onClick={() => navigate('/login')}>لاگین یا ثبت نام</button>
        </div>
      )}
    </div>
  );
};

export default Home;
