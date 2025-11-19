import React, { useState } from 'react';
import { Modal, Input } from 'antd';

interface HeaderSearchProps {
  isModalOpen: boolean;
  onModalClose: () => void;
  onSearch: (query: string) => void;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({
  isModalOpen,
  onModalClose,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    // 主动移除焦点，防止 input 再次触发 onFocus 导致 Modal 重新打开
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === 'function') {
      active.blur();
    }
    onModalClose();
  };

  const handleSearchOk = () => {
    onSearch(searchQuery);
    handleClose();
  };

  return (
    <Modal
      title="全局搜索"
      open={isModalOpen}
      onOk={handleSearchOk}
      onCancel={handleClose}
      okText="搜索"
      cancelText="取消"
      maskClosable
      keyboard
      destroyOnClose
    >
      <Input
        autoFocus
        size="large"
        placeholder="请输入关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onPressEnter={handleSearchOk}
      />
    </Modal>
  );
};

export default HeaderSearch;
