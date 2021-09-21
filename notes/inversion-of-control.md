https://kentcdodds.com/blog/inversion-of-control

Add API to your function. We add `filterFn` to give an ability to adjust functionality.

```javascript
function filter(array, filterFn) {
  let newArray = []
  for (let index = 0; index < array.length; index++) {
    const element = array[index]
    if (filterFn(element)) {
      newArray[newArray.length] = element
    }
  }
  return newArray
}
```
