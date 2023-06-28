import React from 'react';

function Onramp() {
  return (
    <div style={{height:'100vh'}}>
      <iframe
        src="https://onramp.money/main/buy/?appId=487411&walletAddress=5FbG3RL7ftBhHm9eaZ3EDRVWJEFpF8ohct3JeohZdmiF8oDb"
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

export default Onramp;
