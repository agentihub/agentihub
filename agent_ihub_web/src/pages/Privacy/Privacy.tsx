import { MainLayout } from '@/components';
import React from 'react';
import PrivacyContent from './PrivacyContent';

const Privacy: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <PrivacyContent />
      </div>
    </MainLayout>
  );
};

export default Privacy;
