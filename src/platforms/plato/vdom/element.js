import {
  getDoc,
  linkParent,
  nextElement,
  previousElement,
  insertIndex,
  moveIndex,
  uniqueId,
  removeIndex
} from './operation'

const BUBBLE_EVENTS = [
  'click', 'longpress', 'touchstart', 'touchmove', 'touchend'
]
const DEFAULT_TAG_NAME = 'div'
const AnimationArr = []
function registerNode (docId, node) {
  const doc = getDoc(docId)
  doc.nodeMap[node.nodeId] = node
}

export default class Element {
  constructor (type = DEFAULT_TAG_NAME, props = {}) {
    this.nodeType = 1
    this.nodeId = uniqueId()
    this.ref = this.nodeId
    this.type = type
    this.attributes = props.attributes || {}
    this.style = props.style || {}
    this.classStyle = props.classStyle || {}
    this.event = {}

    this.children = []
    this.pureChildren = []

    this.parentNode = null
    this.nextSibling = null
    this.previousSibling = null
  }

  destroy () {
    const doc = getDoc(this.docId)
    if (doc) {
      delete this.docId
      delete doc.nodeMap[this.nodeId]
    }
    this.children.forEach(child => {
      child.destroy()
    })
  }
  appendChild (node) {
    if (node.parentNode && node.parentNode !== this) {
      return
    }
    /* istanbul ignore else */
    if (!node.parentNode) {
      linkParent(node, this)
      insertIndex(node, this.pureChildren, this.pureChildren.length, true)
      if (this.docId) {
        registerNode(this.docId, node)
      }
      if (node.nodeType === 1) {
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), -1)
        }
      }
    } else {
      moveIndex(node, this.children, this.children.length, true)
      if (node.nodeType === 1) {
        const index = moveIndex(node, this.pureChildren, this.pureChildren.length)
        if (Native.document) {
          Native.document.moveElement(this.docId, node.ref, this.ref, index)
        }
      }
    }
  }
  insertBefore (node, before) {
    if (node.parentNode && node.parentNode !== this) {
      return
    }
    if (node === before || (node.nextSibling && node.nextSibling === before)) {
      return
    }
    if (!node.parentNode) {
      linkParent(node, this)
      insertIndex(node, this.children, this.children.indexOf(before), true)
      if (this.docId) {
        registerNode(this.docId, node)
      }
      if (node.nodeType === 1) {
        const pureBefore = nextElement(before)
        const index = insertIndex(
          node,
          this.pureChildren,
          pureBefore
            ? this.pureChildren.indexOf(pureBefore)
            : this.pureChildren.length
        )
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    } else {
      moveIndex(node, this.children, this.children.indexOf(before), true)
      if (node.nodeType === 1) {
        const index = insertIndex(
          node,
          this.pureChildren,
          pureBefore
            ? this.pureChildren.indexOf(pureBefore)
            : this.pureChildren.length
        )
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    }
  }
  insertAfter (node, after) {
    if (node.parentNode && node.parentNode !== this) {
      return
    }
    if (node === after || (node.previousSibling && node.previousSibling === after)) {
      return
    }
    if (!node.parentNode) {
      linkParent(node, this)
      insertIndex(node, this.children, this.children.indexOf(after) + 1, true)
      /* istanbul ignore else */
      if (this.docId) {
        registerNode(this.docId, node)
      }
      if (node.nodeType === 1) {
        const index = insertIndex(
          node,
          this.pureChildren,
          this.pureChildren.indexOf(previousElement(after)) + 1
        )
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    } else {
      moveIndex(node, this.children, this.children.indexOf(after) + 1, true)
      if (node.nodeType === 1) {
        const index = moveIndex(
          node,
          this.pureChildren,
          this.pureChildren.indexOf(previousElement(after)) + 1
        )
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    }
  }
  removeChild (node, preserved) {
    if (node.parentNode) {
      if (node.nodeType === 1) {
        removeIndex(node, this.pureChildren)
        if (Native.document) {
          Native.document.removeElement(this.docId, node.ref)
        }
      }
    }
    if (!preserved) {
      node.destroy()
    }
  }
  clear () {
    if (Native.document) {
      this.pureChildren.forEach(node => {
        Native.document.removeElement(this.docId, node.ref)
      })
    }
    this.children.forEach(node => {
      node.destroy()
    })
    this.pureChildren.length = 0
  }
  // 这里slient代表什么呢?
  setAttr (key, value, silent) {
    if (this.attributes[key] === value && silent !== false) {
      return
    }
    this.attributes[key] = value
    if (!silent && Native.document && this.docId) {
      const result = {}
      result[key] = value
      Native.document.setAttr(this.docId, this.ref, result)
    }
  }
  // setAttrs (batchedAttrs, silent) {
  //   // 批量setAtribute先不做吧
  //   return
  // }
  removeAttribute (key) {
    if (this.attributes[key]) {
      delete this.attributes[key]
    }
  }
  setStyle (key, value, silent) {
    if (this.style[key] === value && silent !== false) {
      return
    }
    this.style[key] = value
    // 这里有一个可能是隐患的东西， this.docId来判断
    if (!silent && Native.document && this.docId) {
      const result = {}
      result[key] = value
      Native.document.setStyles(this.docId, this.ref, result)
    }
  }
  // 这里如果有就有问题。
  // setStyles (batchedAttrs, silent) {
  //   // 批量setStyles先不做吧
  //   console.log('这里没有做哦')
  //   return
  // }
  setClassStyle (classStyle) {
    // reset previous class style to empty string
    for (const key in this.classStyle) {
      this.classStyle[key] = ''
    }

    Object.assign(this.classStyle, classStyle)
    if (Native.document) {
      Native.document.setStyles(this.docId, this.ref, this.toStyle())
    }
  }
  // params参数是干嘛的
  addEvent (type, handler, params) {
    if (!this.event) {
      this.event = {}
    }
    if (!this.event[type]) {
      this.event[type] = {
        handler,
        params
      }
      // 这里有一个可能是隐患的东西， this.docId来判断
      if (Native.document && this.docId) {
        Native.document.addEvent(this.docId, this.ref, type)
      }
    }
  }

  removeEvent (type) {
    if (this.event && this.event[type]) {
      delete this.event[type]
      if (Native.document) {
        Native.document.removeEvent(this.docId, this.ref, type)
      }
    }
  }

  fireEvent (type, event, isBubble, options) {
    let result = null
    let isStopPropagation = false
    const eventDesc = this.event[type]
    if (eventDesc && event) {
      const handler = eventDesc.handler
      event.stopPropagation = () => {
        isStopPropagation = true
      }
      if (options && options.params) {
        result = handler.call(this, ...options.params, event)
      } else {
        result = handler.call(this, event)
      }
    }

    if (!isStopPropagation &&
			isBubble &&
			(BUBBLE_EVENTS.indexOf(type) !== -1) &&
			this.parentNode &&
			this.parentNode.fireEvent) {
      event.currentTarget = this.parentNode
      this.parentNode.fireEvent(type, event, isBubble) // no options
    }
    return result
  }

  toStyle () {
    return Object.assign({}, this.classStyle, this.style)
  }
  regKeyframe(keyframe) {
    if (keyframe == null)
      return;
    let name = Object.keys(keyframe)[0]
    if (AnimationArr.includes(name))
      return;
    AnimationArr.push(name)
    Native.document.addKeyframeMap(this.docId, keyframe)
  }

  addKeyframe(frames) {
    for (let i = 0; i < frames.length; i++) {
        Native.document.addKeyframe(this.docId, frames[i])
    }
  }
  playKeyframe(keyframe, animation) {
      let key = Object.keys(animation)[0];
      let value = animation[key];
      this.regKeyframe(keyframe)
      this.setStyle(key, value)
      Native.document.updateFinish(this.docId)  
  }

  toJSON () {
    const result = {
      id: this.ref,
      docId: this.docId || -10000,
      attributes: this.attributes ? this.attributes : {}
    }
    // 切换一些支持的type
    switch (this.type) {
      case 'div':
        result.type = 'view'
        break
      case 'p':
      case 'span':
        result.type = 'text'
        break
      case 'img':
        result.type = 'image'
        break
      default:
        result.type = this.type
    }
    const styleObj = this.toStyle()
    if (!result.attributes.style) result.attributes.style = {}

    Object.assign(result.attributes.style, styleObj)

    const event = []
    for (const type in this.event) {
      const {
        params
      } = this.event[type]
      if (!params) {
        event.push(type)
      } else {
        event.push({
          type,
          params
        })
      }
    }
    if (event.length) {
      result.event = event
    }
    if (this.pureChildren.length) {
      result.children = this.pureChildren.map((child) => child.toJSON())
    }
    return result
  }
}
