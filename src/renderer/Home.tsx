const { ipcRenderer } = window.electron;
import {
  Card,
  Col,
  Divider,
  Row,
  Space,
  Input,
  Button,
  Steps,
} from 'tdesign-react';
import { ServerIcon, CloseIcon } from 'tdesign-icons-react';
import { ArLoadLine } from './Components';
import { useEffect, useState } from 'react';
import './App.css';
import { LockOnIcon } from 'tdesign-icons-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <div>
        <div style={{ zIndex: 1, position: 'absolute', padding: 50 }}>
          <h1 className="title" style={{ letterSpacing: 3 }}>
            ArSrNa 集群渲染管理
          </h1>
          <span className="lead">控制端</span>
        </div>
        <img src={require('./res/index.jpg')} className="hdpic" />
      </div>

      <div>
        <Steps>
          <Steps.StepItem content="112121" title="完成基础设置" />
        </Steps>
      </div>
    </Space>
  );
}
