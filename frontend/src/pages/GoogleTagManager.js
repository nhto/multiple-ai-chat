import React, { useEffect } from 'react';

const GoogleTagManager = () => {
  useEffect(() => {
    // Create the script element for the gtag.js
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-VJ0JNJVRGR';
    document.head.appendChild(script1);

    // Create the script element for the gtag configuration
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-VJ0JNJVRGR');
    `;
    document.head.appendChild(script2);

    // Cleanup function to remove the scripts when the component unmounts
    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return null; // This component does not render anything
};

export default GoogleTagManager;