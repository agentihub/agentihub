import React from 'react';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown-light.css';

const PrivacyContent: React.FC = () => {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const url = new URL('../../assets/privacyStatement.md', import.meta.url)
          .href;
        const res = await fetch(url);
        const text = await res.text();
        setContent(text);
      } catch (e) {
        setError('无法加载隐私声明');
        console.error(e);
        setContent('无法加载隐私声明');
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, []);

  if (loading) {
    return <div className="text-sm text-[#656d76]">加载中...</div>;
  }

  if (error) {
    return <div className="text-sm text-[#d1242f]">{error}</div>;
  }

  return (
    <div className="w-full px-4 bg-white">
      <div className="max-w-[960px] mx-auto bg-white rounded-lg overflow-hidden m-2">
        <div className="px-5 py-5 text-gray-900">
          <div className="markdown-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyContent;
