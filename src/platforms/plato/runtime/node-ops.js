import TextNode from 'weex/runtime/text-node'

export const namespaceMap = {}

export function createElement (tagName) {
  return platoDocument.createElement(tagName)
}

export function createElementNS (namespace, tagName) {
  return platoDocument.createElement(namespace + ':' + tagName)
}

export function createTextNode (text) {
  return new TextNode(text)
}

export function createComment (text) {
  return platoDocument.createComment(text)
}

export function insertBefore (
  node,
  target,
  before
) {
  if (target.nodeType === 3) {
    if (node.type === 'text' || node.type === 'span' || node.type === 'p') {
      node.setAttr('value', target.text)
      target.parentNode = node
    } else {
      const text = createElement('text')
      text.setAttr('value', target.text)
      node.insertBefore(text, before)
    }
    return
  }
  node.insertBefore(target, before)
}

export function removeChild (node, child) {
  if (child.nodeType === 3) {
    node.setAttr('value', '')
    return
  }
  node.removeChild(child)
}

export function appendChild (node, child) {
  if (child.nodeType === 3) {
    if (node.type === 'text' || node.type === 'span' || node.type === 'p') {
      node.setAttr('value', child.text)
      child.parentNode = node
    } else {
      const text = createElement('text')
      text.setAttr('value', child.text)
      node.appendChild(text)
    }
    return
  }

  node.appendChild(child)
}

export function parentNode (node) {
  return node.parentNode
}

export function nextSibling (node) {
  return node.nextSibling
}

export function tagName (node) {
  return node.type
}

export function setTextContent (node, text) {
  if (node.parentNode) {
    node.parentNode.setAttr('value', text)
  }
}

export function setAttribute (node, key, val) {
  node.setAttr(key, val)
}
export function removeAttribute () {
  console.log('这个方法dom不支持，所以就扔这里了')
}
// 先注释掉吧，
// export function setStyleScope (node: WeexElement, scopeId: string) {
//   node.setAttr('@styleScope', scopeId)
// }
