https://matvii.hodovani.uk/books/The-Pragmatic-Programmer.html
https://livebook.manning.com/book/the-art-of-unit-testing-second-edition/chapter-1/57

A __unit__ test is a piece of a code (usually a method) that invokes another piece of code and checks the correctness of some assumptions afterward. If the assumptions turn out to be wrong, the unit test has failed. A unit is a method or function.


Tests show how to use your code. It can help to understand the code without documentation.

Add test execution to build pipeline

Should we test code perfomance? How? Add actions metrics to the test

Stress testing? Extreme cases?

Think how you would test the code before write it

Tests should run in parallel. Why? It should speedup build. It enshure that tests are independent.

positive and negative tests

### Parameterized Test to avoid code duplication

Pros

- DRY
- Easy to add new test

Cons

- Hard to debug

Compare Parralel and Single Thread test running

![image](https://user-images.githubusercontent.com/12833067/134638135-2920701a-beba-4a39-a727-668fd40328ea.png)
