import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Badge,
  Button,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  AreaChartOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { performanceMonitor } from '../../utils/performanceMonitor';

interface PerformanceMetricsProps {
  showDetails?: boolean;
  refreshInterval?: number; // 自动刷新间隔（毫秒）
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  showDetails = false,
  refreshInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [webVitals, setWebVitals] = useState<any>({});
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 获取性能数据
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const pageLoad = performanceMonitor.getPageLoadMetrics();
      const webVitalsData = performanceMonitor.getWebVitals();
      const memoryInfo = performanceMonitor.getMemoryInfo();
      const resources = performanceMonitor.getResourceMetrics();

      setMetrics({
        pageLoad,
        resources,
        resourceStats: {
          total: resources.length,
          totalSize: resources.reduce((sum, r) => sum + r.size, 0),
          avgDuration:
            resources.reduce((sum, r) => sum + r.duration, 0) /
            resources.length,
        },
      });
      setWebVitals(webVitalsData);
      setMemory(memoryInfo);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    fetchMetrics();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // 获取 Web Vitals 状态
  const getVitalStatus = (name: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'default';

    if (value <= threshold.good) return 'success';
    if (value <= threshold.poor) return 'warning';
    return 'error';
  };

  // 格式化字节大小
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!metrics && !loading) {
    return null;
  }

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        {/* Web Vitals */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ThunderboltOutlined style={{ marginRight: 8 }} />
                Web Vitals
                <Tooltip title="Core Web Vitals 是 Google 提出的网页用户体验指标">
                  <InfoCircleOutlined
                    style={{ marginLeft: 8, color: '#999' }}
                  />
                </Tooltip>
              </span>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                size="small"
                loading={loading}
                onClick={fetchMetrics}
              >
                刷新
              </Button>
            }
            size="small"
          >
            <Row gutter={16}>
              {Object.entries(webVitals).map(([name, value]) => (
                <Col span={12} key={name}>
                  <Statistic
                    title={
                      <Badge
                        status={getVitalStatus(name, value as number)}
                        text={name}
                      />
                    }
                    value={value as number}
                    precision={name === 'CLS' ? 3 : 0}
                    suffix={name === 'CLS' ? '' : 'ms'}
                    valueStyle={{
                      fontSize: '16px',
                      color:
                        getVitalStatus(name, value as number) === 'success'
                          ? '#52c41a'
                          : getVitalStatus(name, value as number) === 'warning'
                            ? '#faad14'
                            : '#ff4d4f',
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 页面加载性能 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                页面加载性能
              </span>
            }
            size="small"
          >
            {metrics?.pageLoad && (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="TTFB"
                    value={metrics.pageLoad.ttfb}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="DOM Ready"
                    value={metrics.pageLoad.domReady}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总加载时间"
                    value={metrics.pageLoad.totalLoad}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="DNS 查询"
                    value={metrics.pageLoad.dnsLookup}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        {/* 内存使用情况 */}
        {memory && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <AreaChartOutlined style={{ marginRight: 8 }} />
                  内存使用情况
                </span>
              }
              size="small"
            >
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span>JS 堆内存使用率</span>
                  <span>{memory.usedPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  percent={memory.usedPercentage}
                  status={memory.usedPercentage > 80 ? 'exception' : 'normal'}
                  showInfo={false}
                />
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="已使用"
                    value={formatBytes(memory.usedJSHeapSize)}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总量"
                    value={formatBytes(memory.totalJSHeapSize)}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* 资源加载统计 */}
        {metrics?.resourceStats && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <AreaChartOutlined style={{ marginRight: 8 }} />
                  资源加载统计
                </span>
              }
              size="small"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="资源总数"
                    value={metrics.resourceStats.total}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="总大小"
                    value={formatBytes(metrics.resourceStats.totalSize)}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="平均加载时间"
                    value={metrics.resourceStats.avgDuration}
                    suffix="ms"
                    precision={0}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* 详细信息 */}
        {showDetails && metrics?.resources && (
          <Col span={24}>
            <Card title="资源详细信息" size="small">
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {metrics.resources
                  .sort((a: any, b: any) => b.duration - a.duration)
                  .slice(0, 20)
                  .map((resource: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip title={resource.name}>
                          <span style={{ fontSize: '12px' }}>
                            {resource.name.split('/').pop()}
                          </span>
                        </Tooltip>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          {resource.type} • {formatBytes(resource.size)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {formatTime(resource.duration)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999' }}>
                          {formatTime(resource.startTime)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PerformanceMetrics;
