chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchWithCookies') {
    chrome.cookies.get({ url: 'https://vrchat.com', name: 'auth' }, async (authCookie) => {
      if (!authCookie) {
        sendResponse({ success: false, error: 'Failed to get cookie. Please make sure you are logged in to your VRChat account.' });
        return;
      }
      
      try {
        await chrome.cookies.set({
          url: 'https://api.vrchat.cloud',
          name: 'auth',
          value: authCookie.value,
          domain: '.vrchat.cloud',
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'no_restriction'
        });
        
        const response = await fetch(request.url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const text = await response.text();
        
        if (response.ok) {
          sendResponse({ success: true, data: JSON.parse(text) });
        } else {
          sendResponse({ success: false, error: `HTTP ${response.status}: ${text}` });
        }
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    
    return true;
  }
  
  if (request.action === 'downloadFile') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    
    return true;
  }
});


