PLATO 项目整理：

PS：（这里现在提供的是个思路方法，和构建设计）

1>
Plato 项目就是 web端提供一份js代码(vue)，然后客户端通过读取对应的js代码，实现绘图逻辑。

2>整体思路：

1> Plato-framework 和 plato-factory
关系：Plato-framework 引用 plato-factory
Plato-framework 是作为Javascript 和 Native 的接入层，负责封装和内嵌客户端的方法以及暴露方法给客户端，实现交互；
Plato-factory: 这个其实就是引用runtime/index.js的方法，其实就是vue的引用;

2> Plato-factory 的细节：（基本上未完成）
runtime/index.js => 重载部分函数： 
* patch 重点函数，Vm的渲染的关键函数。
  引入概念=> modules  处理style, class 和compile模块强相关。
  引入概念=> nodeOps  dom操作相关

* utill/index.js => 清单文件

  1. 列举有哪些标签；
  2. 列举有哪些事件；
  3. 列举reserverdAtrr;

* compiler 编译模式
  核心相关代码  render = f annoymouse() {
  	with(this) {
  		return _c('p', [_vc(xxx) + "xxx" + _sc(xxx) + "xxx" + _s(xxxx)])
  	}
  }

3> Plato-framework的细节 （基本上已完成）

ps: Native 相关事件：详见event.md

* 函数调用(包括回调)：

  Native端暴露函数invokeCallback， _jsf是 web和Native公用 全局函数。

* 模块初始化和load

  Native 提供document, CanvasModuel, Timer, Networking, localStorage 几大模块，这里操作简单，不赘述了

* 实例创建
	
  createInstance(appKey, appCode)

需要做的事情：
1> patch重载函数的编写（这块和compiler的耦合性较强），归属于dom渲染问题;
2> 编译模式 + runtime模式下的directive。
3> event事件相关的处理。
4> js helper, 模拟实现Native与js通信并进行操作的js。
5> android 和 ios 区分逻辑，诸如(android 可以支持es6等，android和chrome内核保持同步更新，ios黑盒，部分写法不支持)