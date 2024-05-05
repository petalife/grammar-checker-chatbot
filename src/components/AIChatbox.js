import React, { useState, useEffect } from 'react';
import Loading from './Loading'; // Import the Loading component
// import Typography from '@mui/material/Typography';
import './AIChatbox.css';
import { MuiFileInput } from 'mui-file-input'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { Link } from "react-router-dom";
import SendIcon from '@mui/icons-material/Send';
import TextField from '@material-ui/core/TextField';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CircularProgress from '@mui/material/CircularProgress';
function AIChatbox() {

  // State to store the data
  const [data, setData] = useState(null);
  // State to manage loading state
  const [isLoading, setIsLoading] = useState(true);
  // State to manage errors
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false)




  useEffect(() => {


    // Detect device width to determine if it's a mobile device
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    handleResize(); // Call initially to set the correct state
    window.addEventListener('resize', handleResize); // Add event listener for window resize


    // Asynchronously fetch data from an API
    const fetchData = async () => {
      try {
        const response = await fetch('https://4d2kgb9xrh.execute-api.us-east-2.amazonaws.com/UAT', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on component unmount
    };

  }, []);

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const handleSend = async () => {
    // setBotTyping(true)
    const thread_id = JSON.parse(data.body)
    console.log(thread_id)
    if (!userInput.trim() && !selectedFile) return;
    //only text case
    else if (userInput.trim() && !selectedFile) {
      setBotTyping(true)
      const messagePayload = {
        thread_id: thread_id,
        user_text_input: userInput.trim()
      };
      addMessage('user', userInput, '');
      setUserInput('');
      setSelectedFile(null);
      await openaiAddMessageAPI(messagePayload)
      const runThreadLoad = {
        thread_id: thread_id,
      };
      const botResponse = await openaiRunThreadAPI(runThreadLoad)
      for (let i = botResponse.length; i > 0; i--) {
        addMessage('bot', botResponse[i - 1]); // Display bot response
      }
      setBotTyping(false)
    }
    else {
      setBotTyping(true)
      let base64Image = '';
      if (selectedFile) {
        base64Image = await convertToBase64(selectedFile);
      }
      const messagePayload = {
        base64_string: base64Image,
      };
      addMessage('user', userInput, base64Image); // Display user message and/or image
      setUserInput('');
      setSelectedFile(null); // Reset the file input
      const botResponse = await openaiAddMessageWithFileAPI(messagePayload)
      addMessage('bot', botResponse); // Display bot response
      setBotTyping(false)
    }

  };
  const addMessage = (sender, text, image = '') => {
    setMessages((prevMessages) => [...prevMessages, { sender, text, image }]);
  };
  const sendMessageToBackend = async (messagePayload) => {
    console.log("messagePayload.image:", messagePayload.image)
    // Placeholder: Replace 'https://your_api_gateway_endpoint' with your actual API Gateway endpoint
    const response = await fetch('https://your_api_gateway_endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.reply || 'Sorry, I could not process that.';
  };

  const openaiAddMessageAPI = async (messagePayload) => {
    const response = await fetch('https://s8gv18zkt5.execute-api.us-east-2.amazonaws.com/UAT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload)
    });

    const data = await response.json();
    return data || 'Sorry, I could not process that.';
  };
  const openaiAddMessageWithFileAPI = async (base64Image) => {
    const response = await fetch('https://fcisclxd1l.execute-api.us-east-2.amazonaws.com/UAT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(base64Image)
    });
    const data = await response.json();
    const dataJson = JSON.parse(data.body)
    const msgList = dataJson['msg_content']
    console.log("dataaaa:", msgList)
    return msgList || 'Sorry, I could not process that.';
  };
  const openaiRunThreadAPI = async (messagePayload) => {
    const response = await fetch('https://5l0v6gci4i.execute-api.us-east-2.amazonaws.com/UAT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });

    const data = await response.json();
    const dataJson = JSON.parse(data.body)
    const msgList = dataJson['msg_list']
    console.log("dataaaa:", msgList)
    return msgList || 'Sorry, I could not process that.';
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleChange = (newFile) => {
    setSelectedFile(newFile);
  }
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#9ce2e2' }}>
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
          </Typography>
          <div className="center">
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }} color="common.black">
              Grammar Checker Chatbot
            </Typography>
          </div>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
          </Typography>
        </Toolbar>

      </AppBar>
      <div className="App">
        <header className="App-header">
          <div
            id="chatbox"
            // style={{ textAlign: 'left', width: '1200px', height: '650px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px', marginBottom: '10px' }}
            style={{ textAlign: 'left', width: isMobile ? 'calc(100% - 56px)': '1200px', height: '650px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px', marginBottom: '10px' }}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <div style={{ display: 'inline-block', maxWidth: '700px', padding: '5px', backgroundColor: msg.sender === 'user' ? '#9ce2e2' : '#e9ecef', color: msg.sender === 'user' ? 'white' : 'black', borderRadius: '10px' }}>
                  {/* <Typography variant="body2" gutterBottom> */}
                  <Typography variant="body1" component="div" sx={{ flexGrow: 1 }} >
                    {msg.text}
                  </Typography>
                  {/* {msg.text} */}
                  {/* </Typography> */}
                  {msg.image && <img src={msg.image} alt="Uploaded" style={{ display: 'block', maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />}
                  {msg.FileReader}
                  {msg.addMessage}
                </div>
              </div>
            ))}
            {botTyping ? <CircularProgress /> : ''}
          </div>
          {/* <Box sx={{ width: 1500 }} role="presentation" > */}
          {/* <Box sx={{ width: isMobile ? '100%' : 1500 }} role="presentation" >
            <TextField
              id="outlined-basic"
              label=""
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              variant="outlined"

              style={{ width: isMobile ? 'calc(100% - 90px)' : 1150 }} // Adjust width based on isMobile
            />
            <IconButton
              aria-label="menu"
              onClick={handleSend}
              sx={{ p: 2 }}
            >
              <SendIcon />
            </IconButton>
          </Box> */}


          {/* <MuiFileInput style={{ width: '1205px', height: '70px', marginBottom: '5px' }} size="small" placeholder="Insert a file" value={selectedFile} onChange={handleChange} /> */}
          <label htmlFor="file-input">
            <input
              id="file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleChange}
            />
            {/* <IconButton
        style={{ width: '100px', height: '70px', marginBottom: '5px' }}
        size="small"
        component="span"
        value={userInput} 
        onChange={(e) => setUserInput(e.target.value)}
      >
        <AttachFileIcon />
      </IconButton> */}
          </label>
        </header>
        <body className="App-body">
        <Box sx={{ width: isMobile ? '100%' : 1500 }} role="presentation" >
            <TextField
              id="outlined-basic"
              label="Input your sentense"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              variant="outlined"

              style={{ width: isMobile ? 'calc(100% - 90px)' : 1150 }} // Adjust width based on isMobile
            />
            <IconButton
              aria-label="menu"
              onClick={handleSend}
              sx={{ p: 2 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </body>
        
      </div>
    </Box>
  );
}

export default AIChatbox;
