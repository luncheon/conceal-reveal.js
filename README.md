# conceal-reveal.js

A tiny vanilla-js library to conceal/reveal elements.  
[Demo](https://luncheon.github.io/conceal-reveal.js/)


## API

### conceal(element: HTMLElement): void

Conceals the element.

### reveal(element: HTMLElement): void

Reveals the concealed element.

### toggle(element: HTMLElement): void

If the element is concealed, reveals the element, otherwise conceals the element.

### concealed(element: HTMLElement): boolean

Returns whether the element is concealed (including transitioning to be concealed).


## Installation

### via [npm](https://www.npmjs.com/package/conceal-reveal) (with a module bundler)

```
$ npm i conceal-reveal
```

```js
import 'conceal-reveal/css/conceal-reveal.min.css'
import { conceal, concealed, reveal, toggle } from 'conceal-reveal'
```

### via CDN ([jsDelivr](https://www.jsdelivr.com/package/npm/conceal-reveal))

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/conceal-reveal@0.1.1/css/conceal-reveal.min.css">
<script src="https://cdn.jsdelivr.net/npm/conceal-reveal@0.1.1"></script>
<script>
  const { conceal, concealed, reveal, toggle } = ConcealReveal
</script>
```

or for [modern browsers](https://caniuse.com/#feat=es6-module):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/conceal-reveal@0.1.1/css/conceal-reveal.min.css">
<script type="module">
  import { conceal, concealed, reveal, toggle } from "https://cdn.jsdelivr.net/npm/conceal-reveal@0.1.1/es/conceal-reveal.min.js"
</script>
```


## How to

### Default concealment

```html
<div>This content is visible by default and can be concealed.</div>
<div class="concealed" aria-hidden="true">This content is concealed by default and can be revealed.</div>
```


### Customize transitions

conceal-reveal.js uses CSS transitions.  
You can override the transition properties for whole elements or specific elements.

```css
/* part of conceal-reveal.css */
.concealing {
  transition: all ease, opacity ease-in-out, border-width cubic-bezier(.5, 0, 1, .5);
  transition-duration: .3s;
}

.revealing {
  transition: all ease, opacity ease-in-out, border-width cubic-bezier(0, .5, .5, 1);
  transition-duration: .3s;
}
```

```css
/* your css */
/* overriding transitions for whole elements */
.concealing,
.revealing {
  transition-duration: .2s;
  transition-timing-function: linear;
}

/* overriding transitions for specific element */
#my-content.concealing {
  transition-duration: 1s;
  transition-timing-function: ease-out;
}
```


## License

[WTFPL](http://www.wtfpl.net)
