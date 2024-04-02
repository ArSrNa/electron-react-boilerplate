import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Watermark,
  MessagePlugin,
  NotificationPlugin,
} from 'tdesign-react';
import 'tdesign-react/es/style/index.css'; // 少量公共样式
import {
  InfoCircleFilledIcon,
  SettingIcon,
  WifiIcon,
  ErrorCircleFilledIcon,
  HomeIcon,
} from 'tdesign-icons-react';
const { Content, Footer, Aside } = Layout;
const { MenuItem } = Menu;

import './App.css';

import Home from './Home';
import Settings from './Settings';
import Network from './Network';
import Copyright from './Copyright';
import { RecoilRoot, useRecoilState } from 'recoil';
import { currentState } from './states';
import Control from './Control';
import Slave from './Slave';
import Error from './error';

console.log('Powered by Ar-Sr-Na');
const { ipcRenderer } = window.electron;

function SideBar() {
  const navigate = useNavigate();
  const [current, setCurrent] = useRecoilState(currentState);
  return (
    <>
      <Menu
        value={current}
        style={{ width: '100%', height: '100%', boxShadow: 'none' }}
        logo={
          <>
            <img height="30" src={require('./logo.png')} alt="logo" />
            <h3>ArRM 集群渲染</h3>
          </>
        }
        onChange={(e) => {
          console.log(e);
          navigate(e.toString());
          setCurrent(e.toString());
        }}
      >
        <MenuItem value="/" icon={<HomeIcon />}>
          首页
        </MenuItem>
        <MenuItem value="/control" icon={<InfoCircleFilledIcon />}>
          控制端状态
        </MenuItem>
        <MenuItem value="/slave" icon={<InfoCircleFilledIcon />}>
          服务端状态
        </MenuItem>
        <MenuItem value="/network" icon={<WifiIcon />}>
          网络信息
        </MenuItem>
        <MenuItem value="/settings" icon={<SettingIcon />}>
          设置
        </MenuItem>
        <MenuItem value="/copyright" icon={<ErrorCircleFilledIcon />}>
          版权说明
        </MenuItem>
      </Menu>
    </>
  );
}

function Main() {
  const navigate = useNavigate();
  const [current, setCurrent] = useRecoilState(currentState);
  const settings =
    localStorage.settings == null ? [] : JSON.parse(localStorage.settings);
  const [status, setStatus] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (localStorage.settings == null) {
      MessagePlugin.info('首次使用，请先完成设置后重启！');
      setCurrent('/settings');
      navigate('/settings');
    } else {
      ipcRenderer.sendMessage('startServer', settings);
      ipcRenderer.once('startServer', (m) => {
        setStatus(m.success);
      });
    }

    ipcRenderer.on('client', (m) => {
      setClient(m);
    });
    CheckUpdate();
  }, []);
  return (
    <>
      <Watermark
        watermarkContent={{
          text: 'Ar-Sr-Na 测试版本',
          fontColor: 'rgba(100,100,100,.1)',
        }}
        y={120}
        x={80}
      >
        <Layout style={{ minHeight: '100vh' }}>
          <Aside style={{ position: 'fixed', height: '100%' }}>
            <SideBar />
          </Aside>
          <Layout>
            <Content style={{ padding: 20, marginLeft: 240 }}>
              <Routes>
                <Route path="/" element={<Home />} />

                <Route
                  path="/slave"
                  element={
                    <Slave
                      settings={settings}
                      status={status}
                      client={client}
                    />
                  }
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/network" element={<Network />} />
                <Route path="/copyright" element={<Copyright />} />
                <Route path="*" element={<Error />} />
              </Routes>
            </Content>
            <Footer>Powered by Ar-Sr-Na</Footer>
          </Layout>
        </Layout>
      </Watermark>
    </>
  );
}

export default function App() {
  return (
    <RecoilRoot>
      <Router>
        <Main />
      </Router>
    </RecoilRoot>
  );
}

function CheckUpdate() {
  const count = 2;
  fetch('https://api.arsrna.cn/release/appUpdate/ArRM_S')
    .then((msg) => msg.json())
    .then((msg) => {
      console.log(msg);
      NotificationPlugin.info({
        title: '版本更新提示',
        content: (
          <>
            {msg.count > count ? (
              <>
                有新版本 {msg.rName} {msg.vNumber}，请
                <a href={msg.link} target="_blank">
                  点此前往下载
                </a>
              </>
            ) : (
              '当前已是最新版本'
            )}
          </>
        ),
        duration: 3500,
        offset: [-10, 10],
        closeBtn: true,
      });
    });
}
