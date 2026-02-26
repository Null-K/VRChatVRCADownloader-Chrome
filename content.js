(function() {
  'use strict';

  let currentUrl = location.href;

  // 创建按钮
  function createButton() {
    const buttonContainer = document.querySelector('.tw-flex.tw-flex-col.tw-gap-3');
    
    if (!buttonContainer) {
      setTimeout(createButton, 3000);
      return;
    }

    if (document.getElementById('custom-vrca-download-button')) {
      return;
    }

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'css-13sdljk e7cdgnz2';
    
    const button = document.createElement('button');
    button.id = 'custom-vrca-download-button';
    button.className = 'css-1vrq36y e7cdgnz1';
    
    button.innerHTML = `
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download css-1efeorg e9fqopp0" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"></path>
      </svg> Download VRCA
    `;

    button.addEventListener('click', async () => {
      const avatarId = window.location.pathname.split('/').pop();
      
      try {
        const result = await chrome.runtime.sendMessage({
          action: 'fetchWithCookies',
          url: `https://api.vrchat.cloud/api/1/avatars/${avatarId}`
        });
        
        if (result.success) {
          const data = result.data;
          
          if (data.unityPackages && data.unityPackages.length > 0) {
            const validPackages = data.unityPackages
              .filter(pkg => 
                pkg.platform === 'standalonewindows' && 
                pkg.assetUrl && 
                pkg.assetUrl.endsWith('/file')
              )
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            if (validPackages.length > 0) {
              const latestPackage = validPackages[0];
              
              chrome.runtime.sendMessage({
                action: 'downloadFile',
                url: latestPackage.assetUrl,
                filename: `${data.name}_${data.id}.vrca`
              });
            } else {
              alert('No downloadable file found for Windows platform.');
            }
          } else {
            alert('No downloadable files found.');
          }
        } else {
          alert('API Request failed: \n' + result.error);
        }
      } catch (error) {
        alert('Operation failed: \n' + error.message);
      }
    });

    buttonWrapper.appendChild(button);
    buttonContainer.appendChild(buttonWrapper);
  }

  // 移除旧按钮
  function removeButton() {
    const oldButton = document.getElementById('custom-vrca-download-button');
    if (oldButton) {
      oldButton.closest('.css-13sdljk.e7cdgnz2')?.remove();
    }
  }

  function checkUrlChange() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;

      if (location.pathname.includes('/home/avatar/')) {
        removeButton();
        setTimeout(createButton, 500);
      }
    }
  }

  setInterval(checkUrlChange, 500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();

