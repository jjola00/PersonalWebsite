"use client";

import { useMemo } from 'react';

const AmbientBackground = ({ effect = 'coalesce' }) => {
  // Generate iframe content with the selected effect
  const iframeContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: transparent;
            }
            
            .content--canvas {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              z-index: 1;
            }
          </style>
        </head>
        <body>
          <div class="content--canvas"></div>
          <script src="/js/noise.min.js"></script>
          <script src="/js/util.js"></script>
          <script src="/js/${effect}.js"></script>
        </body>
      </html>
    `;
  }, [effect]);

  return (
    <iframe
      key={effect} // Force remount when effect changes
      srcDoc={iframeContent}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: -50,
        pointerEvents: 'none',
        background: 'transparent'
      }}
      title={`Ambient Background - ${effect}`}
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default AmbientBackground;
