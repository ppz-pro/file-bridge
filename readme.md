# 丑丑仔
网页里的文件服务器

[试用地址](https://bridge.ppz.我爱你/) (仅支持 10Mb 以内文件，流量好贵！) | [微信聊天群](https://ppz-pro.github.io/.github/)

> 当前分支是用 Golang 写的，另外还有一个 500 行 Javascript 版本（功能较简陋），在[这个分支](https://github.com/ppz-pro/file-bridge/tree/500.js)上。

## 部署
> help! 开发者还不太熟练 Golang，目前仅提供源码部署方式。

##### 需要
+ https（一般需要一个域名、一个公网服务器、一个 ssl 证书）
+ Go v1.21.1

``` bash
git clone https://github.com/ppz-pro/file-bridge.git
cd file-bridge
go run .
```

> **如果没有公网服务器或 http**，但想试一下，可以使用 github 的 codespace 功能，提供免费的、可公网访问的测试服务器和 https。

## 原理
两个“客户端”之间没法直接“传递数据”，因为没有公网地址，于是就需要一个“桥”，连接两个“客户端”。
提供文件供人下载的，我在这里叫它“提供端”，另一个叫“下载端”。

TODO

## License
[unlicense](https://unlicense.org)
