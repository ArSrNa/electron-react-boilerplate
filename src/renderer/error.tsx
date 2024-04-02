export default function Error() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        flexDirection: 'column',
      }}
    >
      <img
        src={require('./res/error.png')}
        alt="错误"
        style={{ width: 100, margin: 10 }}
      ></img>
      <h1>前面的区域，以后再来探索吧？</h1>
      {/* <div className='lead'>页面错误，请确认访问地址是否正确；禁止访问。</div> */}
      <div className="lead">
        建议暂时前往
        <a href="https://www.arsrna.cn" target="_blank">
          https://www.arsrna.cn
        </a>
        获得旧版本功能
      </div>
    </div>
  );
}
