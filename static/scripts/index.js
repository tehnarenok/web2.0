function createElement(params) {
    let element = document.createElement(params.tagName)
    if (params.id) {
        element.setAttribute('id', `${id}`)
    }
    if (params.attr) {
        Object.keys(params.attr).forEach((attribute) => {
            element.setAttribute(attribute, params.attr[attribute])
        })
    }
    if (params.data) {
        element.innerHTML = data
    }
    if (params.children) {
        params.children.forEach(child => {
            element.appendChild(createElement(child))
        })
    }

    return element
}

export default createElement