# jm-ant-design-pro

实际工作中，我们经常把后台的功能被划分为各个独立的模块，根据需要组合使用，jm-ant-design-pro 基于 [ant design pro](https://pro.ant.design/) 实现这一功能。

设计原则上尽量减少对于 ant design pro 的修改，这里说明主要的差异，方便跟随官方版本升级。

## 概念

### 应用 app

后台的一个功能模块，例如用户管理、订单管理、权限管理等。

### 工具类 Loader

定义在 config/router.config.js 中，帮助 ant design pro 编译时自动识别和加载应用。

## 应用 app 约定

主要增加了 routes.json、 locales (可选)、mock（可选），其他部分遵循原写法，不变。

下面的例子定义了一个应用 simple。

```
src/pages/simple/
  models/       // model, 遵循原写法
  services/     // 服务, 遵循原写法
  list.js      // 路由, 遵循原写法
  list.less    // less, 遵循原写法
  locales/      // 国际化文件, 翻译文件必须是json格式，且以 .json 作为扩展名，会被 Loader 合并到项目的根文件夹 locales 中
    en-US.json  // 格式: [语言].json
    zh-CN.json
  mock/         // mock 定义
    simple.js   // 遵循原写法, 注意，文件名称全局唯一，这里的文件会被 Loader 复制到项目的根文件夹 mock 中
  routes.json   // 路由定义，Loader 根据此文件识别应用并且加载
 
```

下面的例子把官方例子重的 Dashboard 改造为一个应用

```
src/pages/Dashboard/
  models/
  Analysis.js
  Analysis.less
  Monitor.js
  Monitor.less
  Workplace.js
  Workplace.less
  locales/      
    en-US.json  
    zh-CN.json
  mock/         
    Dashboard.js
  routes.json   // 应用路由定义，会被 Loaer 加载  
```


## 工作原理

- Loader 遍历 src/pages/ 列出所有子目录
- 循环处理每个子目录
  1. 如果目录中存在 routes.json, 则识别为应用
  1. 合并 routes
  1. 合并 翻译
  1. 复制 mock
- 进入ant design pro 正常启动或者编译流程

## 与 ant design pro 的文件差异
 
### README.jm.md

本说明文件

### package.json

```
  "devDependencies": {
+    "fs-extra": "^7.0.0",  
```
  
### config/router.config.js

增加类 Loader, 实现动态加载 src/pages 文件夹下符合约定的应用 app

```
+const fs = require('fs');
... 

+class Loader { ... }

+const loader = new Loader();

    routes: [
+      ...loader.routes,
```

### src/pages/simple

一个简单的应用例子
