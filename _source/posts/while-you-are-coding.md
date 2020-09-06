---
title: While you are coding
description: Care About Your Craft.
date: 2020-09-06
tags:
  - notes
layout: layouts/post.njk
---

## Program by Coincidence

We should avoid programming by coincidence—relying on luck and accidental successes— in favor of programming deliberately.
**Don't Program by Coincidence**

### How to Program Deliberately

- Always be aware of what you are doing.
- Don't code blindfolded.
- Proceed from a plan.
- Rely only on reliable things.
- Document your assumptions. [Design by Contract](#21-design-by-contract).
- Don't just test your code, but test your assumptions as well. Don't guess [Assertive Programming](#23-assertive-programming)
- Prioritize your effort.
- Don't be a slave to history. Don't let existing code dictate future code. [Refactoring](#33-refactoring)

## Algorithm Speed

Pragmatic Programmers estimate the resources that algorithms use—time, processor, memory, and so on.

### Use: Big O Notation

- **O(1)**: Constant (access element in array, simple statements)

```js
	bool IsFirstElementNull(IList<string> elements)
	{
    	return elements[0] == null;
	}
```

- **O(lg(n))**: Logarithmic (binary search) lg(n) = lg2(n)

```js

	Int BinarySearch(list, target)
	{
	   lo = 1, hi = size(list)
	   while (lo <= hi){
	      mid = lo + (hi-lo)/2
	      if (list[mid] == target) return mid
	      else if (list[mid] < target) lo = mid+1
	      else hi = mid-1
	   }
	}

```

- **O(n)**: Linear: Sequential search

```js

	bool ContainsValue(IList<string> elements, string value)
	{
	    foreach (var element in elements)
	    {
	        if (element == value) return true;
	    }

	    return false;
	}

```

- **O(n lg(n))**: Worse than linear but not much worse(average runtime of quickshort, headsort)
- **O(n²)**: Square law (selection and insertion sorts)

```js

	bool ContainsDuplicates(IList<string> elements)
	{
	    for (var outer = 0; outer < elements.Count; outer++)
	    {
	        for (var inner = 0; inner < elements.Count; inner++)
	        {
	            // Don't compare with self
	            if (outer == inner) continue;

	            if (elements[outer] == elements[inner]) return true;
	        }
	    }

	    return false;
	}

```

- **O(n³)**: Cubic (multiplication of 2 n x n matrices)
- **O(Cⁿ)**: Exponential (travelling salesman problem, set partitioning)

```js

	int Fibonacci(int number)
	{
	    if (number <= 1) return number;

	    return Fibonacci(number - 2) + Fibonacci(number - 1);
	}
```

### Common Sense Estimation

- Simple loops: O(n)
- Nested loops: O(n²)
- Binary chop: O(lg(n))
- Divide and conquer: O(n lg(n)). Algorithms that partition their input, work on the two halves independently, and then combine the result.
- Combinatoric: O(Cⁿ)

**Estimate the Order of Your Algorithms**

**Test Your Estimates**

### Best Isn't Always Best

Be pragmatic about choosing appropriate algorithms—the fastest one is not always the best for the job.

Be wary of premature optimization. Make sure an algorithm really is a bottleneck before investing time improving it.

## Refactoring

Code needs to evolve; it's not a static thing.

### When Should You Refactor?

- Duplication. You've discovered a violation of the DRY principle ([The Evils of Duplication](#7-the-evils-of-duplication)).
- Nonorthogonal design. You've discovered some code or design that could be made more orthogonal ([Orthogonality](#8-orthogonality)).
- Outdated knowledge. Things change, requirements drift, and your knowledge of the problem increases. Code needs to keep up.
- Performance. You need to move functionality from one area of the system to another to improve performance.

**Refactor Early, Refactor Often**

### How Do You Refactor?

- 1. Don't try to refactor and add functionality at the same time.
- 2. Make sure you have good tests before you begin refactoring.
- 3. Take short, deliberate steps.

## Code That's Easy to Test

Build testability into the software from the very beginning, and test each piece thoroughly before trying to wire them together.

### Unit Testing

Testing done on each module, in isolation, to verify its behavior.
A software unit test is code that exercises a module.

### Testing Against Contract

This will tell us two things:

1. Whether the code meet the contract
2. Whether the contract means what we think it means.

**Design to Test**

There's no better way to fix errors than by avoiding them in the first place.
Build the tests before you implement the code.

### Writing Unit Tests

By making the test code readily accessible, you are providing developers who may use your code with two invaluable resources:

1. Examples of how to use all the functionality of your module
2. A means to build regression tests to validate any future changes to the code

You must run them, and run them often.

### Using Test Harnesses

Test harnesses should include the following capabilities:

- A standard way to specify setup and cleanup
- A method for selecting individual tests or all available tests
- A means of analyzing output for expected (or unexpected) results
- A standardized form of failure reporting

### Build a Test Window

- Log files.
- Hot-key sequence.
- Built-in Web server.

### A Culture of Testing

**Test Your Software, or Your Users Will**

## Evil Wizards

If you do use a wizard, and you don't understand all the code that it produces, you won't be in control of your own application.

**Don't Use Wizard Code You Don't Understand**
