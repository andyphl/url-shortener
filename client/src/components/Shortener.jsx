import React, { useState } from 'react';
import axios from 'axios';
import validator from 'validator';

const Shortener = () => {
  const [urls, setUrls] = useState({
    url: '',
    link: ''
  });

  const handleSubmit = async (event) => { 
    event.preventDefault();
    
    const validUrl = validator.isURL(urls.url, {
      require_protocol: true
    });
    if(!validUrl) {
      alert('請輸入正確的URL，必須包含http(s) 🤔')
    }
    else {
      console.log('URL is: ', urls.url);

      await axios.post('http://localhost:5000/api/shorten', {
        originUrl: urls.url
      })
      .then((res) => {
        setUrls({
          ...urls,
          link: `http://localhost:5000/${res.data.hashUrl}`
        })
      })
      .catch((err) => {
        console.log(err);
      });
    }    
  };

  const handleChange = (event) => {
    setUrls({
      ...urls,
      url: event.target.value
    });
  };

  const copyToClipboard = (event) => {
    navigator.clipboard.writeText(urls.link)
    .then(() => {
      console.log('成功複製到剪貼簿')
    })
    .catch((err) => {
      console.log('發生錯誤，請再試一次')
    });
  }

  return (
    <div className="shortener">
      <form onSubmit={ handleSubmit }>
        <div className="shortener__url">
          <input 
            type="text" 
            name="url" 
            placeholder="請輸入URL"
            onChange={ handleChange }
          />
          <input 
            type="submit" 
            value="短它！" 
          />
        </div>
        <div className="shortener__reurl">
          <span id="result">{ urls.link }</span>
          {
            urls.link.length !== 0 ? 
              (<input 
                type="button" 
                value="複製到剪貼簿" 
                onClick={ copyToClipboard }
              />) : ""
          }
        </div>
      </form>
    </div>
  );
};


export default Shortener;