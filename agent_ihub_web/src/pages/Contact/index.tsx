import React from 'react';
import { Typography } from 'antd';
import { PhoneOutlined, MailOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';

const { Title, Paragraph } = Typography;

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <PhoneOutlined className="text-xl text-gray-600" />,
      title: '联系电话',
      content: '020-87587591',
      description: '工作时间：周一至周五 9:00-18:00',
      link: 'tel:020-87587591',
    },
    {
      icon: <MailOutlined className="text-xl text-gray-600" />,
      title: '电子邮箱',
      content: 'service@litevar.com',
      description: '我们会在24小时内回复您的邮件',
      link: 'mailto:service@litevar.com',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-2 font-semibold">
            联系我们
          </Title>
          <Paragraph className="text-base text-gray-600 mb-0">
            我们随时为您提供帮助，欢迎通过以下方式与我们联系
          </Paragraph>
        </div>

        {/* Contact List */}
        <div className="border border-gray-300 rounded-md divide-y divide-gray-300">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">{info.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 mb-1">
                  {info.title}
                </div>
                <a
                  href={info.link}
                  target={info.link.startsWith('http') ? '_blank' : undefined}
                  rel={
                    info.link.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="text-blue-600 hover:underline text-base inline-block mb-1"
                >
                  {info.content}
                </a>
                <div className="text-sm text-gray-600">{info.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
