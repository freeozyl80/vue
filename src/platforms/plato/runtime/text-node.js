let latestNodeId = 1
/* 看下这里是否需要有补齐的 (jaffezhang)*/
export default function TextNode (text) {
  this.instanceId = ''
  this.nodeId = latestNodeId++
  this.parentNode = null
  this.nodeType = 3
  this.text = text
}
