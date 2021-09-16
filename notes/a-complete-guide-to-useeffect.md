https://overreacted.io/a-complete-guide-to-useeffect/

- Each effect function “sees” props and state from the particular render it “belongs” to

> Kingdoms will rise and turn into ashes, the Sun will shed its outer layers to be a white dwarf, and the last civilization will end. But nothing will make the props “seen” by the first render effect’s cleanup anything other than {id: 10}.

- Don’t Lie to React About Dependencies
- Sometimes when you do that, it causes a problem. For example, maybe you see an infinite refetching loop, or a socket is recreated too often. The solution to that problem is not to remove a dependency.
- The first strategy is to fix the dependency array to include all the values inside the component that are used inside the effect.
- The second strategy is to change our effect code so that it wouldn’t need a value that changes more often than we want.
