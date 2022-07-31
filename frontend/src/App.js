import './App.css';
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const UploadS3 = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null);
  const [loginData, setLoginData] = useState(
    null
  );
  const [loading,setLoading] = useState(false)
  const [allfiles, setAllfiles] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('loginData')
      ? JSON.parse(localStorage.getItem('loginData'))
      : null
    console.log(data)
    setLoginData(data)
    if (data) {
      getFiles(data)
    }
    else {
      navigate('/')
    }
  }, [])

  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  }

  const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name)
    setLoading(true)
    axios.post('http://localhost:3000/upload', formData, { headers: { Authorization: `Bearer ${loginData.token}` } }).then(data => {
      console.log('data',data)
      setLoading(false)
      if (data.data === 'success') {
        console.log('success')
        getFiles()
      }
      else{
        console.log('error')
      }
    }).catch(err => {
      setLoading(false)
      console.log('err', err)
    })
  }

  const getFiles = (tokenData) => {
    const token = tokenData ? tokenData.token : loginData.token
    axios.get('http://localhost:3000/getFiles', { headers: { Authorization: `Bearer ${token}` } }).then(data => {
      setAllfiles(data.data.Contents || [])
    }).catch(err => {
      console.log('err', err)
    })
  }

  function downloadBlob(url, name) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downloadFile = (Key) => {
    axios.get(`http://localhost:3000/downloadFile/${Key}`, { headers: { Authorization: `Bearer ${loginData.token}` } }).then(data => {
      downloadBlob(data.data, Key)
    }).catch(err => {
      console.log('err', err)
    })
  }


  const logout = () => {
    localStorage.removeItem('loginData');
    setLoginData(null);
    navigate('/')
  };

  return <div>
    <button onClick={logout} className="logout">logout</button>
    <p className='chooseFile'>Choose a file to upload to s3</p>
    <input type="file" className="fileUpload" onChange={handleFileInput} />
    {selectedFile && <button onClick={() => uploadFile(selectedFile)} className="uploadS3" disabled={loading}> Upload to S3</button>}
    {loading && <p  className="uploadingFiles">UPLOADING FILES ........</p>}
    {allfiles.length > 0 && <p className='uploadedText'>All your uploaded files (Click any file to download)</p>}
    {allfiles.map((value, index) => {
      const filename = loginData?.user?.email ? value.Key.split([loginData.user.email] + '/')[1] : value.Key;
      return <div className="uploadedFile" key={index} onClick={() => downloadFile(filename)}>
        {filename}
        </div>
    })}
  </div>
}

export default UploadS3;
