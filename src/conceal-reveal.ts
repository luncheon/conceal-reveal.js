export const CLASS_CONCEALED = 'concealed'
export const CLASS_CONCEALING = 'concealing'
export const CLASS_REVEALING = 'revealing'

const DATASET_ORIGINAL_HEIGHT = 'concealRevealOriginalHeight'

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
      if (element.dataset[DATASET_ORIGINAL_HEIGHT] === undefined) {
        saveOriginalStyleHeight(element);
      }
      element.style.setProperty('height', `${getCurrentStyleHeight(element)}px`, 'important')
      element.getBoundingClientRect() // reflect height above
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_CONCEALING)
      classList.remove(CLASS_REVEALING)
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
    classList.remove(CLASS_CONCEALING)
    classList.remove(CLASS_CONCEALED)
    if (element.style.height) {
      saveOriginalStyleHeight(element)
    } else {
      restoreOriginalStyleHeight(element)
    }
    if (element.offsetHeight !== currentOffsetHeight) {
      const expandedStyleHeight = getCurrentStyleHeight(element)
      classList.add(CLASS_CONCEALED)
      element.style.height = ''
      element.getBoundingClientRect() // reflect zero-height
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_REVEALING)
      classList.remove(CLASS_CONCEALED)
      element.style.setProperty('height', `${expandedStyleHeight}px`, 'important')
    } else {
      delete element.dataset[DATASET_ORIGINAL_HEIGHT]
    }
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
    restoreOriginalStyleHeight(this)
    delete this.dataset[DATASET_ORIGINAL_HEIGHT]
  }
}

function getCurrentStyleHeight(element: HTMLElement): number {
  const style = getComputedStyle(element)
  return element.offsetHeight - (
    style.boxSizing === 'border-box'
      ? 0
      : parsePx(style.borderTopWidth!) +
        parsePx(style.borderBottomWidth!) +
        parsePx(style.paddingTop!) +
        parsePx(style.paddingBottom!)
  )
}

function parsePx(s: string): number {
  return +s.replace(/px$/, '')
}

function saveOriginalStyleHeight(element: HTMLElement) {
  const priority = element.style.getPropertyPriority('height')
  element.dataset[DATASET_ORIGINAL_HEIGHT] = `${element.style.height || ''}${priority ? '!' + priority : ''}`
}

function restoreOriginalStyleHeight(element: HTMLElement) {
  const originalHeight = (element.dataset[DATASET_ORIGINAL_HEIGHT] || '').split('!')
  element.style.setProperty('height', originalHeight[0], originalHeight[1])
}
