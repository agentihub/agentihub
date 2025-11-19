import React, { Suspense } from 'react';
import AuthWrapper from '../src/components/AuthWrapper';
import { Skeleton } from 'antd';
import { Outlet } from 'react-router-dom';

const RootLayout: React.FC = () => {
  return (
    <AuthWrapper>
      <Suspense fallback={<Skeleton />}>
        <Outlet />
      </Suspense>
    </AuthWrapper>
  );
};

export default RootLayout;
