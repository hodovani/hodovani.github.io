---
title: The Basic Tools
description: Care About Your Craft.
date: 2020-06-17
tags:
  - notes
layout: layouts/post.njk
---

**Keep Knowledge in plain text**

## 14.-The Power of Plain Text

### Drawbacks

- more space
- computationally more expensive

### The Power of Text

- Insurance against obsolescence: you will always have a chance to be able to use text.
- Leverage: Virtually every tool in the computing can operate on plain text.
- Easier testing

## 15.-Shell Games

**Use the power of command Shells**

Can't you do everything equally well by pointing and clicking in a GUI?
**No**. A benefit of GUIs is _WYSIWYG_—what you see is what you get. The disadvantage is _WYSIAYG_—what you see is all you get.

## 16.-Power Editing

**Use a Single Editor Well**

### Editor "must" features

- Configurable
- Extensible
- Programmable
- Syntax highlighting
- Auto-completion
- Auto-indentation
- Initial code or document boilerplate
- Tie-in to help systems
- IDE-like features (compile, debug, and so on)

## 17.-Source Code Control

**Always Use Source Code Control**

## 18.-Debugging

**Fix the Problem, Not the Blame**

**Don't Panic**

### A Debugging Mindset

Don't waste a single neuron on the train of thought that begins "but that can't happen" because quite clearly it can, and has.
Try to discover the root cause of a problem, not just this particular appearance of it.

### Where to Start

- Before you start, check the warnings or better remove all of them.
- You first need to be accurate in your observations and data.

### Debugging Strategies

#### Bug Reproduction

- The best way to start fixing a bug is to make it reproducible.
- The second best way is to make it reproducible with a _single command_.

#### Visualize Your Data

Use the tools that the debugger offers you. Pen and paper can also help.

#### Tracing

Now what happens before and after.

#### Rubber Ducking

Explain the bug to someone else.

#### Process of Elimination

It is possible that a bug exists in the OS, the compiler, or a third-party product—but this should not be your first thought.

**"select" Isn't Broken**

### The Element of Surprise

**Don't Assume It—Prove It**

### Debugging Checklist

- Is the problem being reported a direct result of the underlying bug, or merely asymptom?
- Is the bug really in the compiler? Is it in the OS? Or is it in your code?
- If you explained this problem in detail to a coworker, what would you say?
- If the suspect code passes its unit tests, are the tests complete enough? What happens if you run the unit test with this data?
- Do the conditions that caused this bug exist anywhere else in the system?

## 19.-Text Manipulation

**Learn a Text Manipulation Language**

## 20.-Code Generators

**Write Code That Writes Code**
Two main types of code generators:

- **Passive code generators** are run once to produce a result. They are basically parameterized templates, generating a given output from a set of inputs.
- **Active code generators** are used each time their results are required. Take a single representation of some piece of knowledge and convert it into all the forms your application needs.

### Code Generators Needn't Be Complex

Keep the input format simple, and the code generator becomes simple.

### Code Generators Needn't Generate Code

You can use code generators to write just about any output: HTML, XML, plain text - any text that might be an input somewhere
else in your project.
