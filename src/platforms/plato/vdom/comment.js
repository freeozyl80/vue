import {
  getDoc,
  uniqueId
} from './operation'

export default class Comment {
  constructor (value) {
    this.nodeId = uniqueId()
    this.parentNode = null
    this.nextSibling = null
    this.previousSibling = null

    this.nodeType = 8
    this.nodeId = uniqueId()
    this.ref = this.nodeId
    this.type = 'comment'
    this.value = value
    this.children = []
    this.pureChildren = []
  }

  /**
   * Convert to HTML comment string.
   * @return {stirng} html
   */
  toString () {
    return '<!-- ' + this.value + ' -->'
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
}
