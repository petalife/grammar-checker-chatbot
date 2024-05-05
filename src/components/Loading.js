import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
const Loading = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* <p>Loading...</p> */}
      <CircularProgress />
      {/* You can add any loading spinner or animation here */}
    </div>
  );
};

export default Loading;
