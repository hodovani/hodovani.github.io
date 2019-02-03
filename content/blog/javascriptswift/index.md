---
title: JavaScript.swift
date: "2019-02-02T01:02:03.284Z"
---

How to make import JavaScript package in Swift easier?

Check code here [Source](https://github.com/hodovani/JavaScript.swift)

## What problem does JavaScript.swift solve?

I work mostly with JavaScript and use packages from [NPM](https://www.npmjs.com) is common solution for faster idea prototype.
It is quite hard to not find package for your problem on NPM.

I tried [Swift](https://developer.apple.com/swift/) for last two months and found that amount of ready solution in swift package managers is smaller than in NPM.

Also in Swift 5.0 will be [@dynamicCallable](https://github.com/apple/swift-evolution/blob/master/proposals/0216-dynamic-callable.md) that already help to run Python in Swift and run jupyter notebook.

I wonder what will be good to have same with JavaScript. I found [JavsScriptCore](https://developer.apple.com/documentation/javascriptcore) help execute JavaScript inside app for Apple platform.

NPM has a lot of packages that can be used for free and easy to install.
Swift is a powerful and intuitive programming language that can be run both Apple’s device and Linux.

I just want to make import a little bit easier.

This solution would look like this:

```swift
import JavaScriptCore
let jsSource = "var testFunct = function(message) { return \"Test Message: \" + message;}"
var context = JSContext()
context?.evaluateScript(jsSource)
let testFunction = context?.objectForKeyedSubscript("testFunct")
let result = testFunction?.call(withArguments: ["the message"])
// result would be Test Message: the message.
```

<br/>

Yeah, look nice.
But it would be good to have some sort of `import` or `require` to fast import and use.

Like this one:

```swift
// here `arr-diff` will return different between two passed arrays
let arrDiff = import(“arr-diff”)
let diff = arrDiff([1, 2], [2, 3])
// diff will hold array of diffrenece and will be equal to `[1, 3]`
```

\*[arr-diff](https://www.npmjs.com/package/arr-diff)

## What we can have right now?

JavaScript.Swift provides an API to `import` JS code.
We need a simple working bridge.
Use it to import JavaScript code.

<br/>

Example:

```swift
import JavaScriptSwift

let context = JavaScriptSwift()
try context.importSafe("""
var swiftLib = {
    name: "JavaScrip.swift",
    organizers: [
        {
            name: "Matvii",
            twitter: "@hodovani",
            email: "matvii@hodovani.uk"
        },
        {
            name: "Max",
            twitter: "@maxdesiatov",
            email: "max@desiatov.com"
        }
    ]
};
""")

var conference = context.swiftLib.name
// conference will be "JavaScript.swift"
```

<br/>

This `import` will work only for one file package but it can be improved in future.
See more examples [here](https://github.com/hodovani/JavaScript.swift/blob/master/Tests/JavaScriptSwiftTests/JavaScriptSwiftTests.swift)

## What’s the future roadmap?

In future we will have:
- The `import` that we need.
- The `import` that will allow us to call methods from npm package. And give ability to import any package from npm

## Summary

It was interesting to me to dive into the Swift world. I plan to learn more and share with you.

Please leave feedback on:

- [Github](https://github.com/hodovani/JavaScript.swift)<br/>
- [Twitter](https://twitter.com/hodovani)<br/>
- [Mail](matvii@hodovani.uk)

Thanks, [Max](https://twitter.com/maxdesiatov) for code review and inspiration

