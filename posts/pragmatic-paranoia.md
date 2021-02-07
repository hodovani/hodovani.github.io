---
title: A Pragmatic Paranoia
description: Care About Your Craft.
date: 2020-09-05
tags:
  - notes
layout: layouts/post.njk
---

**You can't write Perfect Software**

No one in the brief history of computing has ever written a piece of perfect software.
Pragmatic Programmers don't trust themselves, either.

## Design by Contract

A correct program is one that does no more and no less than it claims to do.
Use:

- Preconditions
- Postconditions
- Invariants

**Design with Contracts**

Write "lazy" code: be strict in what you will accept before you begin, and promise as little as possible in return.

### Implementing DBC

Simply enumerating at design time:

- what the input domain range is
- what the boundary conditions are
- what the routine promises to deliver (and what it doesn't)

### Assertions

You can use assertions to apply DBC in some range. (Assertions are not propagated in subclasses)

**DBC enforce Crashing Early**

### Invariants

- Loop Invariants: Is true before and during the loop therefore also when the loop finishes
- Semantic Invariants: ie the error should be on the side of not processing a transaction rather than processing a duplicate transaction.

## Dead Programs Tell No Lies

All errors give you information. Pragmatic Programmers tell themselves that if there is an error, something very, very bad has happened.

**Crash Early**

`A dead program normally does a lot less damage than a crippled one.`

When your code discovers that something that was supposed to be impossible just happened, your
program is no longer viable.

## Assertive Programming

**If It Can't Happen, Use Assertions to Ensure That It Won't**

- Assertions are also useful checks on an algorithm's operation.
- Don't use assertions in place of real error handling.
- Leave Assertions Turned On, unless you have critical performance issues.

## When to Use Exceptions

**Use Exceptions for Exceptional Problems**

### What Is Exceptional?

The program must run if all the exception handlers are removed
If your code tries to open a file for reading and that file does not exist, should an exception be raised

- Yes: If the file should have been there
- No: If you have no idea whether the file should exist or not

## How to Balance Resources

When managing resources: memory, transactions, threads, flies, timers—all kinds of things with limited availability, we have to close, finish, delete, deallocate them when we are done.

**Finish What You Start**

### Nest Allocations

- 1.-Deallocate resources in the opposite order to that in which you allocate them
- 2.-When allocating the same set of resources in different places in your code, always allocate them in the same order (prevent deadlocks)

### Objects and Exceptions

Use `finally` to free resources.

_Based on The Pragmatic Programmer Book by Andy Hunt and Dave Thomas_
