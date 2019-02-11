export const CLASS_CONCEALED = 'concealed'
export const CLASS_CONCEALING = 'concealing'
export const CLASS_REVEALING = 'revealing'

const DATASET_ORIGINAL_INLINE_STYLE_HEIGHT = 'concealRevealOriginalInlineStyleHeight'
const DATASET_ORIGINAL_IMPORTANT_INLINE_STYLES = 'concealRevealOriginalImportantInlineStyle'
const MODIFYING_INLINE_STYLE_PROPERTY_NAMES = [
  'overflow-y',
  'min-height',
  'padding-top',
  'padding-bottom',
  'border-top-width',
  'border-bottom-width',
  'margin-top',
  'margin-bottom',
]

/**
 * Returns whether the element is concealed (including transitioning to be concealed).
 */
export function concealed(element: HTMLElement): boolean {
  return element.classList.contains(CLASS_CONCEALED) || element.classList.contains(CLASS_CONCEALING)
}

/**
 * Conceals the element.
 */
export function conceal(element: HTMLElement): void {
  if (!concealed(element)) {
    const classList = element.classList
    if (element.offsetHeight) {
      if (element.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT] === undefined) {
        saveOriginalInlineStyleHeight(element)
      }
      saveOriginalImportantInlineStyles(element)

      // calculate the style height and explicitly set it as inline style
      element.style.setProperty('height', `${getCurrentStyleHeight(element)}px`, 'important')
      element.offsetHeight // reflect height above

      // conceal the element with transition
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_CONCEALING)
      classList.remove(CLASS_REVEALING)
      deleteImportantInlineStyle(element)
      element.style.height = ''
    } else {
      classList.add(CLASS_CONCEALED)
    }
  }
}

/**
 * Reveals the concealed element.
 */
export function reveal(element: HTMLElement): void {
  if (concealed(element)) {
    const currentOffsetHeight = element.offsetHeight
    const classList = element.classList
    element.removeAttribute('aria-hidden')

    // temporarily reveal the element without transition and calculate height
    classList.remove(CLASS_CONCEALING)
    classList.remove(CLASS_CONCEALED)
    if (element.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT] === undefined) {
      saveOriginalInlineStyleHeight(element)
    } else {
      restoreOriginalInlineStyleHeight(element)
    }
    restoreOriginalImportantInlineStyles(element)
    if (element.offsetHeight !== currentOffsetHeight) {
      const expandedStyleHeight = getCurrentStyleHeight(element)

      // conceal the element without transition again
      classList.add(CLASS_CONCEALED)
      deleteImportantInlineStyle(element)
      element.style.height = ''
      element.offsetHeight // reflect zero-height

      // reveal it with transition
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_REVEALING)
      classList.remove(CLASS_CONCEALED)
      element.style.setProperty('height', `${expandedStyleHeight}px`, 'important')
      restoreOriginalImportantInlineStyles(element)
    } else {
      delete element.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT]
    }
    delete element.dataset[DATASET_ORIGINAL_IMPORTANT_INLINE_STYLES]
  }
}

/**
 * If the element is concealed, reveals the element, otherwise conceals the element.
 */
export function toggle(element: HTMLElement): void {
  (concealed(element) ? reveal : conceal)(element)
}

function onTransitionEnd(this: HTMLElement) {
  this.removeEventListener('transitionend', onTransitionEnd)

  const classList = this.classList
  if (classList.contains(CLASS_CONCEALING)) {
    classList.add(CLASS_CONCEALED)
    classList.remove(CLASS_CONCEALING)
    this.setAttribute('aria-hidden', 'true')
  } else if (classList.contains(CLASS_REVEALING)) {
    classList.remove(CLASS_REVEALING)
    restoreOriginalInlineStyleHeight(this)
    delete this.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT]
  }
}

function getCurrentStyleHeight(element: HTMLElement): number {
  const style = getComputedStyle(element)
  return element.offsetHeight - (
    style.boxSizing === 'border-box'
      ? 0
      : parseFloat(style.borderTopWidth!) +
        parseFloat(style.borderBottomWidth!) +
        parseFloat(style.paddingTop!) +
        parseFloat(style.paddingBottom!)
  )
}

function saveOriginalInlineStyleHeight(element: HTMLElement) {
  const priority = element.style.getPropertyPriority('height')
  element.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT] = `${element.style.height || ''}${priority ? ' !' + priority : ''}`
}

function restoreOriginalInlineStyleHeight(element: HTMLElement) {
  const originalHeight = (element.dataset[DATASET_ORIGINAL_INLINE_STYLE_HEIGHT] || '').split(' !')
  element.style.setProperty('height', originalHeight[0], originalHeight[1] || '')
}

function saveOriginalImportantInlineStyles(element: HTMLElement) {
  let styleString = ''
  for (const propertyName of MODIFYING_INLINE_STYLE_PROPERTY_NAMES) {
    if (element.style.getPropertyPriority(propertyName) === 'important') {
      styleString += `${propertyName}: ${element.style.getPropertyValue(propertyName)}; `
    }
  }
  styleString && (element.dataset[DATASET_ORIGINAL_IMPORTANT_INLINE_STYLES] = styleString.trim())
}

function restoreOriginalImportantInlineStyles(element: HTMLElement) {
  const styleString = element.dataset[DATASET_ORIGINAL_IMPORTANT_INLINE_STYLES]
  if (styleString) {
    const pattern = /\s*([^:\s]+)\s*:\s*([^;\s]+)\s*;?/g
    let result: ReturnType<typeof pattern.exec>
    while (result = pattern.exec(styleString)) {
      element.style.setProperty(result[1], result[2], 'important')
    }
  }
}

function deleteImportantInlineStyle(element: HTMLElement) {
  for (const propertyName of MODIFYING_INLINE_STYLE_PROPERTY_NAMES) {
    if (element.style.getPropertyPriority(propertyName) === 'important') {
      element.style.removeProperty(propertyName)
    }
  }
}
