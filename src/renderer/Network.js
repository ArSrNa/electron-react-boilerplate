import { useEffect, useState } from "react"
import { Row, Col, Table } from "tdesign-react";
import { ArLoadLine } from './Components';
import './App.css'
import { publicIp, publicIpv4, publicIpv6 } from 'public-ip';
const { ipcRenderer } = window.electron;

export default function Network() {
    const [intIP, setIntIP] = useState([]);
    const [PublicIPV4, setPublicIPV4] = useState(null);
    const [PublicIPV6, setPublicIPV6] = useState(null);
    useEffect(() => {
        publicIpv4()
            .then(ip => setPublicIPV4(ip))
            .catch(e => setPublicIPV6(<span style={{ color: 'red' }}>获取失败或不存在</span>));
        publicIpv6()
            .then(ip => setPublicIPV6(ip))
            .catch(e => setPublicIPV6(<span style={{ color: 'red' }}>获取失败或不存在</span>));

        ipcRenderer.sendMessage('getIP');
        ipcRenderer.once('getIP', m => {
            const res = [];
            for (let key of Object.keys(m)) {
                m[key].map(ip => {
                    res.push({ key, ip: ip.address, family: ip.family })
                })
            }
            // console.log(res)
            setIntIP(res);
        })
    }, []);


    return (
        <div>
            <h1>网络信息</h1>
            <Row gutter={16}>
                <Col span={4}>
                    <div className='card-title'>公网</div>
                    <Table
                        data={[{
                            IPType: 'ipv4',
                            AdrInt: PublicIPV4 == null ? <ArLoadLine /> : PublicIPV4
                        }, {
                            IPType: 'ipv6',
                            AdrInt: PublicIPV6 == null ? <ArLoadLine /> : PublicIPV6
                        }]}
                        columns={[
                            { colKey: 'IPType', title: 'IP类型', width: 100 },
                            { colKey: 'AdrInt', title: '地址' },
                        ]}
                        bordered

                    />
                </Col>

                <Col span={8}>
                    <div className='card-title'>内网</div>
                    <Table
                        data={intIP}
                        columns={[
                            { colKey: 'key', title: '网卡' },
                            { colKey: 'ip', title: '地址' },
                        ]}
                        bordered
                    />
                </Col>
            </Row>
        </div>
    )
}