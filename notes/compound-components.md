https://kentcdodds.com/blog/compound-components-with-react-hooks
https://www.smashingmagazine.com/2021/08/compound-components-react/

### What Is A Compound Component?

Compound components can be said to be a pattern that encloses the state and the behavior of a group of components but still gives the rendering control of its variable parts back to the external user.

### When Should You Make Use Of Compound Components?

- Solve issues related to building reusable components;
- Development of highly cohesive components with minimal coupling;
- Better ways to share logic between components.

### Cons

One of the major cons of building components in React with the compound component pattern is that only direct children of the parent component will have access to the props, meaning we can’t wrap any of these components in another component.
