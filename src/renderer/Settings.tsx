import {
  Card,
  MessagePlugin,
  Space,
  Form,
  Input,
  Radio,
  Checkbox,
  Button,
  Switch,
  DatePicker,
  InputNumber,
  Upload,
} from 'tdesign-react';
import { LockOnIcon } from 'tdesign-icons-react';
import { useEffect, useReducer, useRef, useState } from 'react';
const { FormItem } = Form;
const { ipcRenderer } = window.electron;

export default function Settings() {
  const [form] = Form.useForm();

  useEffect(() => {
    const settings = localStorage.settings;
    if (!(settings == null)) {
      form.setFieldsValue(JSON.parse(settings));
    }
  }, []);

  const changeBlenderPath = () => {
    ipcRenderer.invoke('setBlenderPath').then((m) => {
      form.setFieldsValue({ blenderPath: m });
    });
  };

  const changeOutPath = () => {
    ipcRenderer.invoke('setOutPath').then((m) => {
      form.setFieldsValue({ outPath: m });
    });
  };

  return (
    <>
      <Card title="基本设置">
        <Form
          form={form}
          onSubmit={(e) => {
            console.log(e);
            localStorage.setItem('settings', JSON.stringify(e.fields));
            MessagePlugin.success('保存成功');
          }}
          labelAlign="left"
          layout="vertical"
          preventSubmitDefault
          resetType="empty"
          showErrorMessage
        >
          <FormItem label="Blender路径" name="blenderPath">
            <Input
              placeholder="点击选择 blender.exe"
              onClick={changeBlenderPath}
            />
          </FormItem>

          <FormItem label="输出目录" name="outPath">
            <Input
              placeholder="点击选择 渲染输出及缓存目录"
              onClick={changeOutPath}
            />
          </FormItem>

          <FormItem label="监听端口" name="port" initialData={4003}>
            <InputNumber
              placeholder="服务端端口，请对此端口放开防火墙"
              theme="column"
            />
          </FormItem>

          <FormItem label="服务端密码" name="password">
            <Input
              prefixIcon={<LockOnIcon />}
              placeholder="密码，用于控制端连接"
              // value={value}
              type="password"
            />
          </FormItem>

          <FormItem>
            <Button type="submit" theme="primary">
              保存
            </Button>
          </FormItem>
        </Form>
      </Card>
    </>
  );
}
