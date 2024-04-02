const { ipcRenderer } = window.electron;
import { Card, Col, Divider, Row, Space, Input } from 'tdesign-react';
import { ServerIcon, CloseIcon } from 'tdesign-icons-react';
import { ArLoadLine } from './Components';
import { useEffect, useState } from 'react';
import './App.css';
import { LockOnIcon } from 'tdesign-icons-react';
import { useNavigate } from 'react-router-dom';

export default function Home({ settings, status, client }) {
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [bversion, setBversion] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!(settings.blenderPath == null)) {
      ipcRenderer.sendMessage('getBlenderVer', { path: settings.blenderPath });
      ipcRenderer.once('getBlenderVer', (m) => {
        setBversion(m.split('\r\n')[0]);
      });
    }
    console.log(settings);
    ipcRenderer.on('blenderOut', (m) => {
      setStdout(m);
    });
    ipcRenderer.on('blenderErr', (m) => {
      setStderr(m);
    });
  }, []);

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <div>
        <div style={{ zIndex: 1, position: 'absolute', padding: 50 }}>
          <h1 className="title" style={{ letterSpacing: 3 }}>
            ArSrNa 集群渲染管理
          </h1>
          <span className="lead">服务端</span>
        </div>
        <img src={require('./res/index.jpg')} className="hdpic" />
      </div>

      <div>
        <h1>基本信息</h1>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row gutter={8}>
            <Col span={4}>
              <Card>
                <div className="card-title">服务端状态</div>
                {status ? (
                  <span style={{ color: 'green' }}>
                    已在 {settings.port} 端口监听
                  </span>
                ) : (
                  <>
                    正在启动
                    <ArLoadLine />
                  </>
                )}
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <div className="card-title">blender 版本号</div>
                <div
                  style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bversion == null ? (
                    <>
                      正在获取
                      <ArLoadLine />
                    </>
                  ) : (
                    bversion
                  )}
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <div className="card-title">控制端</div>
                {client == null ? (
                  <span style={{ color: 'yellow' }}>等待连接</span>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {client}
                    <CloseIcon
                      size="large"
                      onClick={() => ipcRenderer.sendMessage('closeWSC')}
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <Card>
                <div className="card-title">IP地址</div>
                请前往
                <a
                  onClick={() => navigate('/network')}
                  style={{ color: 'green' }}
                >
                  网络信息
                </a>
                页面查看
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <div className="card-title">端口</div>
                {settings.port}
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <div className="card-title">密码</div>
                <Input
                  prefixIcon={<LockOnIcon />}
                  value={settings.password}
                  readonly
                  type="password"
                />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>

      <div>
        <h1>日志</h1>
        <div className="code">
          <Divider align="left">StdOut</Divider>
          {stdout}
          <Divider align="left">StdErr</Divider>
          <span style={{ color: 'red' }}>{stderr}</span>
        </div>
      </div>
    </Space>
  );
}
