import {
  addDoc,
  removeDoc,
  appendBody,
  setBody
} from './operation'
import Element from './element'
import Comment from './comment'

function updateElement (el, changes) {
  const attrs = changes.attrs || {}
  for (const name in attrs) {
    el.setAttr(name, attrs[name], true)
  }
  const style = changes.style || {}
  for (const name in style) {
    el.setStyle(name, style[name], true)
  }
}

export default class Document {
  constructor (id) {
    id = id ? id : 0
    this.id = id
    this.nodeMap = {}
    addDoc(id, this)
    this.createDocumentElement()
  }

  getRef (ref) {
    return this.nodeMap[ref]
  }

  createDocumentElement () {
    if (!this.documentElement) {
      const el = new Element('document')
      el.docId = this.id
      el.ownerDocument = this
      el.role = 'documentElement'
      el.depth = 0
      el.ref = '_documentElement'
      this.nodeMap._documentElement = el
      this.documentElement = el
      Object.defineProperty(el, 'appendChild', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: (node) => {
          appendBody(this, node)
        }
      })

      Object.defineProperty(el, 'insertBefore', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: (node, before) => {
          appendBody(this, node, before)
        }
      })
    }

    return this.documentElement
  }

  createBody (type, props) {
    if (!this.body) {
      const el = new Element(type, props)
      setBody(this, el)
    }

    return this.body
  }

  createElement (tagName, props) {
    return new Element(tagName, props)
  }
  // 这个看看能不能用到
  fireEvent (el, type, event, domChanges, options) {
    if (!el) {
      return
    }
    event = event || {}
    event.type = event.type || type
    event.target = el
    event.currentTarget = el
    event.timestamp = Date.now()
    if (domChanges) {
      updateElement(el, domChanges)
    }
    const isBubble = this.getRef('_root').attributes['bubble'] === 'true'
    return el.fireEvent(type, event, isBubble, options)
  }
  destroy () {
    delete this.listener
    delete this.nodeMap
    removeDoc(this.id)
  }
  createComment (text) {
    return new Comment(text)
  }
}
