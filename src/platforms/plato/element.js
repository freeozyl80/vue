import {
  getDoc,
  getTaskCenter,
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

function registerNode (docId, node) {
  const doc = getDoc(docId)
  doc.nodeMap[node.nodeId] = node
}

export default class Element {
  constructor (type = DEFAULT_TAG_NAME) {
    this.nodeType = 1
    this.nodeId = uniqueId()
    this.ref = this.nodeId
    this.type = type
    this.attributes = props.attributes || {}
    this.style = props.style || {}
    this.classStyle = props.classStyle || {}

    this.event = {}

    this.children = []
    // this.pureChildren = []

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
      insertIndex(node, this.children, this.children.length, true)
      if (this.docId) {
        registerNode(this.docId, node)
      }
      if (node.nodeType === 1) {
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    } else {
      moveIndex(node, this.children, this.children.length, true)
      if (node.nodeType === 1) {
        const index = moveIndex(node, this.children, this.children.length)
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
        const index = insertIndex(
          node,
          this.children,
          this.children.length
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
          this.children,
          this.children.length
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
          this.children,
          this.children.indexOf(after) + 1
        )
        const taskCenter = getTaskCenter(this.docId)
        if (Native.document) {
          Native.document.addElement(this.docId, this.ref, node.toJSON(), index)
        }
      }
    } else {
      moveIndex(node, this.children, this.children.indexOf(after) + 1, true)
      if (node.nodeType === 1) {
        const index = moveIndex(
          node,
          this.children,
          this.children.indexOf(after) + 1
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
        removeIndex(node, this.children)
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
      this.children.forEach(node => {
        Native.document.removeElement(this.docId, node.ref)
      })
    }
    this.children.forEach(node => {
      node.destroy()
    })
    this.children.length = 0
  }
  // 这里slient代表什么呢?
  setAttr (key, value, silent) {
    if (this.attributes[key] === value && silent !== false) {
      return
    }
    this.attributes[key] = value
    if (!silent && Native.document) {
      const result = {}
      result[key] = value
      Native.document.setStyles(this.docId, this.ref, result)
    }
  }
  setAttrs (batchedAttrs, silent) {
    // 批量setAtribute先不做吧
    return
  }
  setStyle (key, value, silent) {
    if (this.style[key] === value && silent !== false) {
      return
    }
    this.style[key] = value
    if (!silent && Native.document) {
      const result = {}
      result[key] = value
      Native.document.setStyles(this.docId, this.ref, result)
    }
  }
  setStyles (batchedAttrs, silent) {
    // 批量setStyles先不做吧
    return
  }
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
      if (Native.document) {
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

  toJSON () {
    const result = {
      id: this.ref,
      type: this.type,
      docId: this.docId || -10000,
      attributes: this.attributes ? this.attributes : {}
    }
    result.attributes.style = this.toStyle()

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
    if (this.children.length) {
      result.children = this.children.map((child) => child.toJSON())
    }
    return result
  }
}
