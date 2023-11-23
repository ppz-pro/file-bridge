class Server {
  private status: -2 | -1 | 0 | 1 | 2 = 0 // 断开中 | 停止中 | 未开启 | 开启中 | 已开启
  
  async start() {
    console.log('starting server')
    // const ws = new WebSocket(`ws://${location.host}/provider/conn`) // location.host = location.hostname + location.port
    await new Promise(res =>
      setTimeout(res, 1000)
    )
  }

  stop() {

  }
}

export default new Server()
