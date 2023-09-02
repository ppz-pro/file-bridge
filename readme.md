# 文件桥
+ 提供 p2p 的文件传输
+ 是一个 Node.js 应用，0 依赖，现在只有 399 行代码，也还存在很多问题，解决后代码不会超过 500 行

需要：
+ Node.js（用新点的版本：18、20，我还没测老版本）
+ 一个公网可访问的服务器
+ https

##### 如果你只想测试一下
但为测试方便，建议直接使用 github 的 codespace 功能，提供免费的、带公网 ip 的测试服务器和 https
+ fork 本仓库
+ 创建 codespace
+ 在打开的 codespace 命令行里输入命令：`node file_bridge.js`

##### 如果你要部署
现在还处于开发阶段，只有简陋的功能，而且有很多问题未修复，所以还不建议...

但以免你真想在真正的服务器上试一试：
``` bash
git clone https://github.com/ppz-pro/file-bridge.git
cd file-bridge
node file_bridge.js
```
