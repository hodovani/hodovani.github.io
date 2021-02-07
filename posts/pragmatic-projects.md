---
title: Pragmatic Projects
description: Care About Your Craft.
date: 2020-09-05
tags:
  - notes
layout: layouts/post.njk
---

## Pragmatic Teams

Pragmatic techniques that help an individual can work for teams.

### No Broken Windows

Quality is a team issue.

Teams as a whole should not tolerate broken windows—those small imperfections that no one fixes.

Quality can come only from the individual contributions of all team members.

### Boiled Frogs

People assume that someone else is handling an issue, or that the team leader must have OK'd a change that your user is requesting. Fight this.

### Communicate

The team as an entity needs to communicate clearly with the rest of the world.

People look forward to meetings with them, because they know that they'll see a well-prepared performance that makes everyone feel good.

There is a simple marketing trick that helps teams communicate as one: generate a brand.

### Don't Repeat Yourself

Appoint a member as the project librarian.

### Orthogonality

It is a mistake to think that the activities of a project—analysis, design, coding, and testing—can happen in isolation. They can't. These are different views of the same problem, and artificially separating them can cause a boatload of trouble.

**Organize Around Functionality, Not Job Functions**

- Split teams by functionally. Database, UI, API
- Let the teams organize themselves internally
- Each team has responsibilities to others in the project (defined by their agreed-upon commitments)
- We're looking for cohesive, largely self-contained teams of people

Organize our resources using the same techniques we use to organize code, using techniques such as contracts (Design by Contract), decoupling (Decoupling and the Law of Demeter), and orthogonality (Orthogonality), and we help isolate the team as a whole from the effects of change.

### Automation

Automation is an essential component of every project team

### Know When to Stop Adding Paint

## Ubiquitous Automation

### All on Automatic

**Don't Use Manual Procedures**

Using _cron_, we can schedule backups, nightly build, Web site... unattended, automatically.

### Compiling the Project

We want to check out, build, test, and ship with a single command

- Generating Code
- Regression Tests

### Build Automation

A build is a procedure that takes an empty directory (and a known compilation environment) and builds the project from scratch, producing whatever you hope to produce as a final deliverable.

- 1. Check out the source code from the repository
- 2. Build the project from scratch (marked with the version number).
- 3. Create a distributable image
- 4. Run specified tests

When you don't run tests regularly, you may discover that the application broke due to a code change made three months ago. Good luck finding that one.

**Nightly build** run it every night.

**Final builds** (to ship as products), may have different requirements from the regular nightly build.

### Automatic Administrivia

Our goal is to maintain an automatic, unattended, content-driven workflow.

- Web Site Generation results of the build itself, regression tests, performance statistics, coding metrics...
- Approval Procedures get marks `/* Status: needs_review */`, send email...

### The Cobbler's Children

Let the computer do the repetitious, the mundane—it will do a better job of it than we would. We've got more important and more difficult things to do.

## Ruthless testing

Pragmatic Programmers are driven to find our bugs now, so we don't have to endure the shame of others finding our bugs later.

**Test Early. Test Often. Test Automatically.**

Tests that run with every build are the most effective.

The earlier a bug is found, the cheaper it is to remedy. "Code a little, test a little".

**Coding Ain't Done til All the Tests Run**

### 3 Main aspects:

#### 1.-What to Test

- Unit testing: code that exercises a module.
- Integration testing: the major subsystems that make up the project work and play well with each other.
- Validation and verification: test if you are delivering what users needs.
- Resource exhaustion, errors, and recovery: discover how it will behave under real-world conditions. (Memory, Disk, CPU, Screen...)
- Performance testing: meets the performance requirements under real-world conditions.
- Usability testing: performed with real users, under real environmental conditions.

#### 2.-How to Test

- Regression testing: compares the output of the current test with previous (or known) values. Most of the tests are regression tests.
- Test data: there are only two kinds of data: real-world data and synthetic data.
- Exercising GUI systems: requires specialized testing tools, based on a simple event capture/playback model.
- Testing the tests: After you have written a test to detect a particular bug, cause the bug deliberately and make sure the test complains.

**Use Saboteurs to Test Your Testing**

- Testing thoroughly:

**Test State Coverage, Not Code Coverage**

#### 3.-When to Test

As soon as any production code exists, it needs to be tested.
Most testing should be done automatically.

### Tightening the Net

If a bug slips through the net of existing tests, you need to add a new test to trap it next time.

**Find Bugs Once**

## It's All Writing

If there's a discrepancy, the code is what matters—for better or worse.

**Treat English as Just Another Programming Language**

**Build Documentation In, Don't Bolt It On**

### Comments in Code

In general, comments should discuss why something is done, its purpose and its goal.

Remember that you (and others after you) will be reading the code many hundreds of times, but only writing it a few times.

Even worse than meaningless names are misleading names.

One of the most important pieces of information that should appear in the source file is the author's name—not necessarily who edited the file last, but the owner.

### Executable Documents

Create documents that create schemas. The only way to change the schema is to change the document.

### Technical Writers

We want the writers to embrace the same basic principles that a Pragmatic Programmer does—especially honoring the DRY principle, orthogonality, the model-view concept, and the use of automation and scripting.

### Print It or Weave It

Paper documentation can become out of date as soon as it's printed.

Publish it online, on the Web.

Remember to put a date stamp or version number on each Web page.

Using a markup system, you have the flexibility to implement as many different output formats as you need.

### Markup Languages

Documentation and code are different views of the same underlying model, but the view is all that should be different.

## Great Expectations

The success of a project is measured by how well it meets the expectations of its users.

**Gently Exceed Your Users' Expectations**

### Communicating Expectations

Users initially come to you with some vision of what they want. You cannot just ignore it.

Everyone should understand what's expected and how it will be built.

### The Extra Mile

Give users that little bit more than they were expecting.

- Balloon or ToolTip help
- Keyboard shortcuts
- A quick reference guide as a supplement to the user's manual
- Colorization
- Log file analyzers
- Automated installation
- Tools for checking the integrity of the system
- The ability to run multiple versions of the system for training
- A splash screen customized for their organization

### Pride and Prejudice

Pragmatic Programmers don't shirk from responsibility. Instead, we rejoice in accepting challenges and in making our expertise well known.

We want to see pride of ownership. "I wrote this, and I stand behind my work."

**Sign Your Work**

_Based on The Pragmatic Programmer Book by Andy Hunt and Dave Thomas_
