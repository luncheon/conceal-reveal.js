const CLASS_CONCEALED = 'concealed'
const CLASS_CONCEALING = 'concealing'
const CLASS_REVEALING = 'revealing'

const DATASET_ORIGINAL_HEIGHT = 'concealRevealOriginalHeight'

function concealingOrConcealed(classList: HTMLElement['classList']): boolean {
  return classList.contains(CLASS_CONCEALED) || classList.contains(CLASS_CONCEALING)
}

export function conceal(element: HTMLElement): void {
  const classList = element.classList
  if (!concealingOrConcealed(classList)) {
    if (element.offsetHeight) {
      const originalHeight = element.style.height
      element.style.setProperty('height', `${getStyleHeight(element)}px`, 'important')
      element.getBoundingClientRect() // reflect height above
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_CONCEALING)
      classList.remove(CLASS_REVEALING)
      element.style.height = originalHeight
    } else {
      classList.add(CLASS_CONCEALED)
    }
  }
}

export function reveal(element: HTMLElement): void {
  const classList = element.classList
  if (concealingOrConcealed(classList)) {
    const clone = element.cloneNode(true) as typeof element
    clone.classList.remove(CLASS_CONCEALING)
    clone.classList.remove(CLASS_CONCEALED)
    clone.style.visibility = 'hidden'
    clone.style.position = 'absolute'
    clone.style.top = clone.style.left
                    = 0 as any as string
    clone.style.setProperty('width', `${getStyleWidth(element)}px`, 'important');
    element.parentElement!.insertBefore(clone, element)
    const expandedStyleHeight = getStyleHeight(clone)
    const expandedOffsetHeight = clone.offsetHeight
    clone.parentElement!.removeChild(clone)
    if (expandedOffsetHeight !== element.offsetHeight) {
      element.addEventListener('transitionend', onTransitionEnd)
      classList.add(CLASS_REVEALING)
      element.dataset[DATASET_ORIGINAL_HEIGHT] = element.dataset[DATASET_ORIGINAL_HEIGHT] || element.style.height || ''
      element.style.setProperty('height', `${expandedStyleHeight}px`, 'important')
    }
    element.removeAttribute('aria-hidden')
    classList.remove(CLASS_CONCEALING)
    classList.remove(CLASS_CONCEALED)
  }
}

export function toggle(element: HTMLElement): void {
  (concealingOrConcealed(element.classList) ? reveal : conceal)(element)
}

function onTransitionEnd(this: HTMLElement) {
  const classList = this.classList
  this.removeEventListener('transitionend', onTransitionEnd)
  if (classList.contains(CLASS_CONCEALING)) {
    classList.add(CLASS_CONCEALED)
    classList.remove(CLASS_CONCEALING)
    this.setAttribute('aria-hidden', 'true')
  }
  classList.remove(CLASS_REVEALING)

  if (this.dataset[DATASET_ORIGINAL_HEIGHT] !== undefined) {
    this.style.height = this.dataset[DATASET_ORIGINAL_HEIGHT]!
    delete this.dataset[DATASET_ORIGINAL_HEIGHT]
  }
}

function getStyleWidth(element: HTMLElement): number {
  const style = getComputedStyle(element)
  return element.offsetWidth - (
    style.boxSizing === 'border-box'
      ? 0
      : parsePx(style.borderLeftWidth!) +
        parsePx(style.borderRightWidth!) +
        parsePx(style.paddingLeft!) +
        parsePx(style.paddingRight!)
  )
}

function getStyleHeight(element: HTMLElement): number {
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
