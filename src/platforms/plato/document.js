import {
  addDoc,
  removeDoc,
  appendBody,
  setBody
} from './operation'
import Element from './Element'

class Document {
  constructor (id) {
    id = id ? id.toString() : ''
    this.id = id
    addDoc(id, this)
  }
}

export default class Document {
  constructor (id) {
    id = id ? id.toString() : ''
    this.id = id
    this.URL = url
    addDoc(id, this)
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

  /**
	 * Create the body element.
	 * @param {string} type
	 * @param {objct} props
	 * @return {object} body element
	 */
  createBody (type, props) {
    if (!this.body) {
      const el = new Element(type, props)
      setBody(this, el)
    }

    return this.body
  }

  /**
	 * Create an element.
	 * @param {string} tagName
	 * @param {objct} props
	 * @return {object} element
	 */
  createElement (tagName, props) {
    return new Element(tagName, props)
  }

  /**
	 * Create an comment.
	 * @param {string} text
	 * @return {object} comment
	 */
  createComment (text) {
    return new Comment(text)
  }

  /**
	 * Fire an event on specified element manually.
	 * @param {object} element
	 * @param {string} event type
	 * @param {object} event object
	 * @param {object} dom changes
	 * @param {object} options
	 * @return {} anything returned by handler function
	 */
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
    const isBubble = this.getRef('_root').attr['bubble'] === 'true'
    return el.fireEvent(type, event, isBubble, options)
  }

  /**
	 * Destroy current document, and remove itself form docMap.
	 */
  destroy () {
    this.taskCenter.destroyCallback()
    delete this.listener
    delete this.nodeMap
    delete this.taskCenter
    removeDoc(this.id)
  }
}
