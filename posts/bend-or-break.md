---
title: Bend or break
description: Care About Your Craft.
date: 2020-09-06
tags:
  - notes
layout: layouts/post.njk
---

## Decoupling and the Law of Demeter

### Minimize Coupling

Be careful about how many other modules you interact with and how you came to interact with them.

Traversing relationships between objects directly can quickly lead to a combinatorial explosion.

```java

	book.pages().last().text().

	// Instead, we're supposed to go with:

	book.textOfLastPage()
```

Symptoms:

1. Large projects where the command to link a unit test is longer than the test program itself
2. "Simple" changes to one module that propagate through unrelated modules in the system
3. Developers who are afraid to change code because they aren't sure what might be affected

### The Law of Demeter for Functions

The Law of Demeter for functions states that any method of an object should call only methods belonging to:

```js

class Demeter {
	private A a;
	void m(B b) {
		a.hello(); 							//itself
		b.hello(); 							//any parameters that were passed to the method
		new Z().hello(); 					// any object it created
		Singleton.INSTANCE.hello(); 		// any directly held component
	}
}
```

**Minimize Coupling Between Modules**

### Does It Really Make a Difference?

Using The Law of Demeter will make your code more adaptable and robust, but at a cost:
you will be writing a large number of wrapper methods that simply forward the request on to a delegate. imposing both a runtime cost and a space overhead.
Balance the pros and cons for your particular application.

## Metaprogramming

"Out with the details!" Get them out of the code. While we're at it, we can make our code highly configurable and "soft"—that is, easily adaptable to changes.

### Dynamic Configuration

**Configure, Don't Integrate**

### Metadata-Driven Applications

We want to configure and drive the application via metadata as much as possible.
_Program for the general case, and put the specifics somewhere else —outside the compiled code base_

**Put Abstractions in Code Details in Metadata**

Benefits:

- It forces you to decouple your design, which results in a more flexible and adaptable program.
- It forces you to create a more robust, abstract design by deferring details—deferring them all the way out of the program.
- You can customize the application without recompiling it.
- Metadata can be expressed in a manner that's much closer to the problem domain than a general-purpose programming language might be.
- You may even be able to implement several different projects using the same application engine, but with different metadata.

### When to Configure

A flexible approach is to write programs that can reload their configuration while they're running.

- long-running server process: provide some way to reread and apply metadata while the program is running.
- small client GUI application: if restarts quickly no problem.

## Temporal Coupling

Two aspects of time:

- Concurrency: things happening at the same time
- Ordering: the relative positions of things in time

We need to allow for concurrency and to think about decoupling any time or order dependencies.
Reduce any time-based dependencies

### Workflow

Use [activity diagrams](https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Activity_conducting.svg/2000px-Activity_conducting.svg.png) to maximize parallelism by identifying activities that could be performed in parallel, but aren't.

**Analyze Workflow to Improve Concurrency**

### Architecture

Balance load among multiple consumer processes: **the hungry consumer model.**

In a hungry consumer model, you replace the central scheduler with a number of independent consumer tasks and a centralized work queue. Each consumer task grabs a piece from the work queue and goes on about the business of processing it. As each task finishes its work, it goes back to the queue for some more. This way, if any particular task gets bogged down, the others can pick up the slack, and each individual component can proceed at its own pace. Each component is temporally decoupled from the others.

**Design Using Services**

### Design for Concurrency

Programming with threads imposes some design constraints—and that's a good thing.

- Global or static variables must be protected from concurrent access
- Check if you need a global variable in the first place.
- Consistent state information, regardless of the order of calls
- Objects must always be in a valid state when called, and they can be called at the most awkward times. Use class invariants, discussed in Design by Contract.

### Cleaner Interfaces

Thinking about concurrency and time-ordered dependencies can lead you to design cleaner interfaces as well.

**Always Design for Concurrency**

### Deployment

You can be flexible as to how the application is deployed: standalone, client-server, or n-tier.

If we design to allow for concurrency, we can more easily meet scalability or performance requirements when the time comes—and if the time never comes, we still have the benefit of a cleaner design.

## It's Just a View

### Publish/Subscribe

Objects should be able to register to receive only the events they need, and should never be sent events they don't need.

Use this publish/subscribe mechanism to implement a very important design concept: the separation of a model from views of the model.

### Model-View-Controller

Separates the model from both the GUI that represents it and the controls that manage the view.

Advantage:

- Support multiple views of the same data model.
- Use common viewers on many different data models.
- Support multiple controllers to provide nontraditional input mechanisms.

**Separate Views from Models**

### Beyond GUIs

The controller is more of a coordination mechanism, and doesn't have to be related to any sort of input device.

- **Model** The abstract data model representing the target object. The model has no direct knowledge of any views or controllers.
- **View** A way to interpret the model. It subscribes to changes in the model and logical events from the controller.
- **Controller** A way to control the view and provide the model with new data. It publishes events to both the model and the view.

## Blackboards

A blackboard system lets us decouple our objects from each other completely, providing a forum where knowledge consumers and producers can exchange data anonymously and asynchronously.

### Blackboard Implementations

With Blackboard systems, you can store active objects—not just data—on the blackboard, and retrieve them by partial matching of fields (via templates and wildcards) or by subtypes.

Functions that a Blackboard system should have:

- **read** Search for and retrieve data from the space.
- **write** Put an item into the space.
- **take** Similar to read, but removes the item from the space as well.
- **notify** Set up a notification to occur whenever an object is written that matches the template.

Organizing Your Blackboard by partitioning it when working on large cases.

**Use Blackboards to Coordinate Workflow**

_Based on The Pragmatic Programmer Book by Andy Hunt and Dave Thomas_
