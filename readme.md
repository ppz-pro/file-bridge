# 文件桥
提供 p2p 的文件传输

## 部署
##### 需要
+ 一个公网可访问的服务器
+ Node.js
+ https

``` bash
git clone https://github.com/ppz-pro/file-bridge.git
cd file-bridge
node file_bridge.js
```

**如果没有公网服务器或 http**，但想试一下，
可以使用 github 的 codespace 功能，提供免费的、可公网访问的测试服务器和 https：
+ fork 本仓库
+ 创建 codespace
+ 在打开的 codespace 命令行里执行：`node file_bridge.js`

> 一般 codespace 会用网页版 vscode 打开，执行 `node file_bridge.js` 之后，会提示你“在浏览器中打开”。
> 如果未提示，需要在“终端”面板旁边的“端口”面板里手动添加端口映射（现在用的是 6666），添加之后，旁边会有访问链接。

## 原理
两个“客户端”之间没法直接“传递数据”，因为没有公网地址，于是就需要一个“桥”，连接两个“客户端”。  
提供文件供人下载的，我在这里叫它“提供端”，另一个叫“下载端”。  

1. “桥”为每一个“提供端”生成一个 id（以下称为“提供端 id”）
2. “提供端”使用 [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) 读取用户指定的目录，把目录结构发给“桥”
3. “下载端”根据“提供端 id”从“桥”那里获取目录结构
4. “下载端”要下载文件时，向“桥”发送“下载请求”并指定“提供端 id”及文件路径，桥会**把这个请求存起来**
5. 用户在“提供端”指定“允许下载的目录”后，“提供端”程序就开始每隔 1 秒向“桥”发请求：问一问“有没有谁想下载我的文件”
6. 上两个步骤，一个想下载别人的文件，一个想让人下载，一拍即合，而传文件只需一行代码 [http.IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage).pipe([http.ServerResponse](https://nodejs.org/api/http.html#class-httpserverresponse))

> 其实第 5 步的“每隔 1 秒”很膈应，但原生 Node.js 对 Websocket 支持度比较低，而专门封装一个 Websocket 可能需要几十甚至上百行代码，于是作罢。反正，，，，这只是个有趣的项目，我是说，，，一开始就没以实用为目的。当然，适当地改造一下，也可以很实用，但谁能拒绝“仅使用原生模块”的诱惑呢。

> 这个项目更加深我那个刻板印象：编程的难点不在于“让人使用”，而是“不让人使用”，比如“非法用户”和“未付费用户”。其实“未付费用户”就是“非法用户”。

## License
[unlicense](https://unlicense.org)
