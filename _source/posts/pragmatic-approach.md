---
title: A Pragmatic Approach
description: Care About Your Craft.
date: 2020-09-05
tags:
  - notes
layout: layouts/post.njk
---

## The Evils of Duplication

The problem arises when you need to change a representation of things that are across all the code base.
Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

**DRY—Don't Repeat Yourself**

Types of duplication:

- **Imposed duplication** Developers feel they have no choice—the environment seems to require duplication.
- **Inadvertent duplication** Developers don't realize that they are duplicating information.
- **Impatient duplication** Developers get lazy and duplicate because it seems easier.
- **Interdeveloper duplication** Multiple people on a team (or on different teams) duplicate a piece of information.

**Make it easy to reuse**

## Orthogonality

Two or more things are orthogonal if changes in one do not affect any of the others. Also called _cohesion_.
Write "shy" code.

**Eliminate Effects Between Unrelated Things**

Benefits:

- Gain Productivity
  - Changes are localized
  - Promotes reuse
  - M x N orthogonal components do more than M x N non orthogonal components
- Reduce Risk
  - Diseased sections or code are isolated
  - Are better tested
  - Not tied to a product or platform
- Project Teams: Functionality is divided
- Design: Easier to design a complete project through its components
- Toolkits and Libraries: Choose wisely to keep orthogonality
- Coding: In order to keep orthogonality when adding code do:
  - Keep your code decoupled
  - Avoid global data
  - Avoid similar functions
- Testing: Orthogonal systems are easier to test.
- Documentation: Also gain quality

## Reversibility

Be prepared for changes.

**There are no Final Decisions.**

## Tracer Bullets

In new projects your users requirements may be vague. Use of new algorithms, techniques, languages, or libraries unknowns will come. And environment will change over time before you are done.
We're looking for something that gets us from a requirement to some aspect of the final system quickly, visibly, and repeatably.

**Use Tracer Bullets to Find the Target**

Advantages:

- Users get to see something working early
- Developers build a structure to work in
- You have an integration platform
- You have something to demonstrate
- You have a better feel for progress

### Tracer Bullets Don't Always Hit Their Target

Tracer bullets show what you're hitting. This may not always be the target. You then adjust your aim until they're on target. That's the point.

### Tracer Code versus Prototyping

With a prototype, you're aiming to explore specific aspects of the final system.
Tracer code is used to know how the application as a whole hangs together.

Prototyping generates disposable code.
Tracer code is lean but complete, and forms part of the skeleton of the final system.

## Prototypes and Post-it Notes

We build software prototypes to analyze and expose risk, and to offer chances for correction at a greatly reduced cost.

Prototype anything that:

- carries risk
- hasn't been tried before
- is absolutely critical to the final system
- is unproven
- is experimental
- is doubtful

Samples:

- Architecture
- New functionality in an existing system
- Structure or contents of external data
- Third-party tools or components
- Performance issues
- User interface design

**Prototype to Learn**

Avoid details:

- Correctness
- Completeness
- Robustness
- Style

Prototyping Architecture:

- Are the responsibilities of the major components well defined and appropriate?
- Are the collaborations between major components well defined?
- Is coupling minimized?
- Can you identify potential sources of duplication?
- Are interface definitions and constraints acceptable?
- Does every module have an access path to the data it needs during execution?

**Never deploy the prototype**

## Domain Languages

**Program Close to the Problem domain**

## Estimating

**Estimate to Avoid Surprises**

### How Accurate Is Accurate Enough?

**First:** Do they need high accuracy, or are they looking for a ballpark figure?

**Second:** Scale time estimates properly

| Duration   | Quote estimate in                    |
| ---------- | ------------------------------------ |
| 1-15 days  | days                                 |
| 3-8 weeks  | weeks                                |
| 8-30 weeks | months                               |
| 30+ weeks  | think hard before giving an estimate |

### Where Do Estimates Come From?

Ask someone who's been in a similar situation in the past.

- Understand What's Being Asked
- Build a Model of the System
- Break the Model into Components
- Give Each Parameter a Value
- Calculate the Answers
- Keep Track of Your Estimating Prowess

### Estimating Project Schedules

The only way to determine the timetable for a project is by gaining experience on that same project.
Practice incremental development, repeating the following steps:

- Guess estimation
- Check requirements
- Analyze risk
- Design, implement, integrate
- Validate with the users
- Repeat

The refinement and confidence in the schedule gets better and better each iteration

**Iterate the Schedule with the Code**

### What to Say When Asked for an Estimate

**"I'll get back to you."**

### Challenges

Start keeping a log of your estimates. For each, track how accurate you turned out to be. If your error was greater than 50%, try to find out where your estimate went wrong.
