https://overreacted.io/writing-resilient-components/

### Don’t Get Distracted by Imaginary Problems

Linter is your friend. With a good config, a linter is a great tool to catch bugs before they happen.

### Marie Kondo Your Lint Config

But what about formatting? Use Prettier

### Writing Resilient Components

### Principle 1: Don't stop the data flow

- Don't stop the data flow in rendering. 
- Read the props directly in your component and avoid copying props (or anything computed from the props) into state. 
- Use useMemo to memoize expensive computations.
- Don't stop the data flow in side effects. 
- Use useEffect to track side effect dependencies.
- Don't stop the data flow in optimizations.
- With useCallback and useContext, you can avoid passing functions deep down altogether. This lets you optimize rendering without worrying about functions.

### Principle 2: Always be ready for render

- Component shouldn’t break just because it or its parent re-renders more often

### Principle 3: No Component Is a Singleton

- Even if a component is rendered just once, your design will improve if rendering twice doesn’t break it.

### Principle 4: Keep the Local State Isolated

- Think about which state is local to a particular UI representation — and don’t hoist that state higher than necessary.
