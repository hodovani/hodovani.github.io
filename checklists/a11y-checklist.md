# A11y Checklist 
A quick checklist for accessibility practices and tools for web developers. These are not only aimed at people with permanent disabilities, they [target the whole internet](https://thewholeinternet.com/). Contributions are more than welcome!

### 👀 Visual 
These practices and patterns are helping users with various types of dissabilities (permanent or temporary), from color-blindness, to vestibular dysfunction, to low vision to hearing deficits.

* color contrast, **>4.5** for AA standard, **>7.0** for AAA (a lot of tools can automate this check for the entire site)
* aim for _bigger_ contrast for _smaller_ text
* prioritize text contrast vs borders / other elements
* use **icons** or other visual indicators together with color (ex: showing errors in forms)
* min font-size should be **16px**
* keep 80 characters per line when displaying longer texts and ensure standard spacing for paragraphs
* ensure animations are _necessary_ and not _unexpected_
* use [**prefers-reduced-motion**](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) to disable animations when users opt-in from their OS
* ensure videos have _subtitles_ or _auto-captions_
* ensure that at least 5 zoom levels are available on your website and that the layout responds well to zooming in

### ✅ Semantic HTML 
The use of semantic HTML is crucial for [offering support](http://wicg.github.io/aom/explainer.html) to screen readers and other assistive technologies. By default, HTML does a pretty decent job at this, but you have to make sure you follow the standard and don't override useful defaults.

* avoid using a <div> when a semantic tag can be used instead
* use standard **landmarks** for defining: header, main, footer, etc.
* use **headings** in the right order, always start from **h1**
* form inputs should always be accompanied by **labels**
* menus should start from a **<nav>** element and contains _lists_ and _list items_
* use relevant **titles** for links - they are read by screen readers as users tab their way through the site
* avoid titles like: "click here" or "read more", as they give no indication about the actual link
* images should be accompanied by relevant **alt** texts
* use _ARIA_ attributes only when there's no semantic alternative

### ✋ Interaction
Never make assumptions about how your users interact with the website and make sure you have support for things like keyboard navigation. Some of these practices target people with motion difficulties, tremors and other problems limiting their interaction skills.

* _links_ and _buttons_ should always be keyboard focusable (using the tab key)
* _menus_ and _lists_ should be keyboard accessible (left-right for navigation)
* modal windows have to close when pressing the Esc key
* always show an outline when focusing elements - at a minimum, support keyboard outline with [what-input](https://github.com/ten1seven/what-input)
* **focus** should be handled in parallel with click/tap events as well as with :hover pseudo-selectors
* don't use tabindex > 0, allow a natural flow for the focus through the interface
* trap focus when showing modal/overlays, so the user cannot navigate behind the foreground
* handle focus after navigation - especially for SPA-like applications which are not reloading the page
* ensure a **touch area** of at least 44px

### 🔨 Tools & Projects
* Screen Readers
  * **Jaws** for Windows
  * **NVDA**
  * **VoiceOver** on OS-X/iOS
  * **Orca** for Linux
* [lighthouse](https://developers.google.com/web/tools/lighthouse/) - performs audits in chrome (the audit tab in devtools).
* [axe-core](https://github.com/dequelabs/axe-core) - performs e2e automated tests for a11y issues, can easily be integrated in cypress or jest.
* [tota11y](https://khan.github.io/tota11y/) - shows a11y validations on top of existing websites.
* [alexjs](https://alexjs.com/) - catches insensitive and inconsiderate writing.
* [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y) - ESLint plugin for static analysis of a11y violations.
* [ReachUI](https://ui.reach.tech/) - a list of a11y first React components
* [Inclusive Components](https://inclusive-components.design/) - a list of articles and examples of inclusive and accessibile components

### 📝 References 
* [A guide to color accessibility in product design](https://www.invisionapp.com/inside-design/color-accessibility-product-design/)
* [Designing Accessible Content: Typography, Font Styling, and Structure](https://webdesign.tutsplus.com/articles/designing-accessible-content-typography-font-styling-and-structure--cms-31934)
* [Designing Safer Web Animation For Motion Sensitivity
](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)
* [Accessibility showcases of real projects](https://a11ywins.tumblr.com/)
* [Web Accessibility Course on Udacity](https://eu.udacity.com/course/web-accessibility--ud891)
* [Useful Accessibility Resources by Stefan Judis](https://www.stefanjudis.com/useful-accessibility-resources/)
* [Status of a11y support in browsers](https://www.html5accessibility.com/)
* [Building Accessible Menu Systems](https://www.smashingmagazine.com/2017/11/building-accessible-menu-systems/)
* [Human Interface Guidelines for iOS](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
* [Handling Touch Targets](https://a11yproject.com/posts/large-touch-targets/)
* [WAI-ARIA Guidelines](https://www.w3.org/WAI/standards-guidelines/aria/)

 
 # Accessibility Checklist

## Table of Contents

* **[HTML](#html)**
* **[CSS](#css)**
* **[OTHER](#other)**
* **[BEHAVIOR](#behavior)**
* **[TOOLS](#tools)**
* **[USEFUL LINKS](#useful-links)**

## HTML

**Add `alt` attribute with description or not (then empty) to every `<img>` tag**
> * [1.1.1 - Non-text Content - Level](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=111#qr-text-equiv-all)

**Use only one `<h1>` per page**
> * [1.3.1 - Info and Relationships - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=131#qr-content-structure-separation-programmatic)
> * [Creating on outline (look at the Warning)](http://w3c.github.io/html/sections.html#creating-an-outline)
> * [Computer says NO to HTML5 document outline](http://html5doctor.com/computer-says-no-to-html5-document-outline/)

**Use proper and semantic HTML tags to presenting and behavior of content**
* Examples:
  * Date and time should be in the `<time>` tag
  * Table data should be in the `<table>` tag
  * Use `<caption>` to title of the table
  * If you have "Back to top" button on the page you should use `<button>` tag to this
  * To listed items use `<ul>` `<li>` (items ordered isn't important) or `<ol>` `<li>` (items ordered is important)
  * Use `<figure`> tag with `<figcaption>` to embeds
  * Watch out for the difference between `<b>` / `<strong>` and `<i>` / `<em>`
  * Use `<label>`s tag to `<input>`s tags
> * [1.3.1 - Info and Relationships - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=131#qr-content-structure-separation-programmatic)

**Separating content layer (HTML) from presentation layer (CSS)**
> * [1.3.1 - Info and Relationships - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=131#content-structure-separation-programmatic)

**Add `dir` attribute to `<html>` tag**
> * [1.3.2 - Meaningful Sequence - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=132#qr-content-structure-separation-sequence)

**Don't use `maximum-scale=1.0` in viewport `<meta>` tag**
> * [1.4.4 - Resize text - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=144#qr-visual-audio-contrast-scale)

**Use skip links navigation**
> * [2.4.1 - Bypass Blocks - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=241#qr-navigation-mechanisms-skip)

**Use `<title>` tag**
> * [2.4.2 - Page Titled - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=242#qr-navigation-mechanisms-title)

**Add `lang` attribute to `<html>` tag**
> * [3.1.2 - Language of Parts - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=312#qr-meaning-other-lang-id)

## CSS

**Contrast ratio should be 4.5:1 for normal text and 3:1 for large text**
> * [1.4.3 - Contrast (Minimum) - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=143#qr-visual-audio-contrast-contrast)
> * [1.4.6 - Contrast (Enhanced) - Level AAA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=146#qr-visual-audio-contrast7)

**Don't remove focus (outline property in CSS) from interactive tags (`<a>`, `<button>`, `<input>` etc.)**
> * [2.4.7 - Focus Visible - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=247#qr-navigation-mechanisms-focus-visible)
> * [3.2.1 - On Focus - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=321#qr-consistent-behavior-receive-focus)
> * [DON'T DO IT - CSS outline property - outline: none and outline: 0](http://www.outlinenone.com/)

## OTHER
**Provide transcript for video or audio media (prerecorded)**
> * [1.2.1 - Audio-only and Video-only (Prerecorded) - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=121#qr-text-equiv-all)

**Provide captions for video or audio media (prerecorded)**
> * [1.2.2 - Captions (Prerecorded) - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=122#media-equiv-captions)

**Provide audiodescripton or alternative media (prerecorded)**
> * [1.2.3 - Audio Description or Media Alternative (Prerecorded) - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=123#media-equiv-audio-desc)

**Provide captions for live audio or video**
> * [1.2.4 - Captions (Live) - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=124#media-equiv-audio-desc)

**Provide audiodescription for prerecorded video**
> * [1.2.5 - Audio Description (Prerecorded) - Level AA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=125#media-equiv-audio-desc)

**Provide sign language for media content**
> * [1.2.6 - Sign Language (Prerecorded) - Level AAA](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=126#media-equiv-audio-desc)

## BEHAVIOR
**Don't use shapes, colors, sounds to continue execute instructions. (Click on the red shape to continue)**
> * [1.3.3 - Sensory Characteristics - Level A](https://www.w3.org/WAI/WCAG20/quickref/#content-structure-separation-understanding)

**If you have a form with required inputs don't use only colors to provide information about that**
> * [1.4.1 - Use of Color - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=141#visual-audio-contrast-without-color)

**If you have an audio automatically plays for more than 3 second should have mechanism to play, pause and stop this or control audio volume independent from OS**
> * [1.4.2 - Audio Control - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=142#visual-audio-contrast-dis-audio)

**Ensure tab sequence is logical**
> * [2.4.3 - Focus Order - Level A](https://www.w3.org/WAI/WCAG20/quickref/?showtechniques=243#qr-navigation-mechanisms-focus-order)

## TOOLS 
* [NVDA (NonVisual Desktop Access)](https://www.nvaccess.org/)
* Accessibility Tab in Chrome DevTools
* [Lighthouse](https://github.com/GoogleChrome/lighthouse)

## USEFUL LINKS
* http://www.html5accessibility.com/
* https://webaim.org/
* https://bbc.github.io/accessibility-news-and-you/
