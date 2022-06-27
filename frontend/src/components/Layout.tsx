import React from 'react';

const Layout = ({ children }: any) => {
  return (
    <main
      style={{
        height: '100vh',
        width: '100%',
      }}
    >
      {children}
    </main>
  );
};

export default Layout;
