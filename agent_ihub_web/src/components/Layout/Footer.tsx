import React from 'react';
import logo from '@/assets/images/logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-[1447px] mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs text-[#59636e]">
          <img
            src={logo}
            alt="logo"
            className="w-6 h-6 object-cover rounded-full"
          />
          <span>© 2025 广州轻变量信息科技有限公司 版权所有</span>
          <a
            href="/privacy"
            rel="noopener noreferrer"
            className="hover:text-[#0969da] hover:underline"
          >
            隐私
          </a>
          {/* <a href="#" className="hover:text-[#0969da] hover:underline">
            {/* <a href="#" className="hover:text-[#0969da] hover:underline">
              状态
            </a> */}
          <a href="/contact" className="hover:text-[#0969da] hover:underline">
            联系我们
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
