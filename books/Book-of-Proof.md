https://www.people.vcu.edu/~rhammack/BookOfProof/

> Why I want to read it?

I want to understand proofs better and be able to write some too.

## Sets

### Introduction to Sets

A __set__ is a collection of things. The things are called elements of the set.

An __infinity set__ has infinity many elements; otherwise it is called a __finite__ set.

Two sets are __equal__ if they conatin exact the same elements.

Let A abd B be sets. Let a ∈ A and b ∈ B. If a ∈ B and b ∈ A, then A = B.

__a ∈ A__ means a is a member of the set A

__A ⊆ B__ means A is a subset of B.

<img src="https://render.githubusercontent.com/render/math?math=A = {2,3,4,5}">
<img src="https://render.githubusercontent.com/render/math?math=2 \in A">
<img src="https://render.githubusercontent.com/render/math?math=7 \notin A">

The set of __natural numbers__ <img src="https://latex.codecogs.com/svg.image?\mathbb{N}=\{1,2,3,...\}" title="\mathbb{N}=\{1,2,3,...\}" />

The set of __integers__ <img src="https://latex.codecogs.com/svg.image?\mathbb{Z}=\{...,-3,-2,-1,0,1,2,3,...\}" title="\mathbb{Z}=\{...,-3,-2,-1,0,1,2,3,...\}" />

If X is a finite set, its __cardinality__ or __size__ is the number of elements it has, and this number is denoted as <img src="https://render.githubusercontent.com/render/math?math=|X|">

__Set-builder notation__ is used to describe sets.

<img src="https://latex.codecogs.com/svg.image?E=&space;\left\{&space;2n:n&space;\in&space;\mathbb{Z}&space;\right\}" title="E= \left\{ 2n:n \in \mathbb{Z} \right\}" />

__Definition 1.1__ An ordered pair is a list (x, y) of two things x and y, enclosed in parentheses and separated by a comma.

__Definition 1.2__ The Cartesian product of two sets A and B is another set, denoted as A×B and defined as A×B={(a,b):a ∈ A,b ∈ B}.

*Fact 1.1* If A and B are finite sets, then |A×B|=|A|·|B|.

__Definition 1.3__ Suppose A and B are sets. If every element of A is also an element of B, then we say A is a subset of B, and we denote this as A ⊆ B. We write A ⊈ B if A is not a subset of B, that is, if it is not true that every element of A is also an element of B. Thus A ⊈ B means that there is at least one element of A that is not an element of B.

*Fact 1.2* The empty set is a subset of all sets, that is,∅ ⊆ B for any set B.

*Fact 1.3* If a finite set has n elements, then it has 2n subsets.

__Definition 1.4__ If A is a set, the power set of A is another set, denoted as 𝒫(A) and defined to be the set of all subsets of A. In symbols, 𝒫(A) = {X : X ⊆ A}.

*Fact 1.4* If A is a finite set, then |P(A)| = 2^(|A|).

The set 𝒫(ℝ^2) is mind boggling. Think of ℝ^2 = {(x,y) : x,y ∈ ℝ} as the set of all points on the Cartesian plane.

__Definition 1.5__ Suppose A and B are sets. 

The __union__ of A and B is the set A∪B = {x : x ∈ A or x ∈ B}.

The __intersection__ of A and B is the set A∩B = {x : x ∈ A and x ∈ B}. 

The __difference__ of A and B is the set A − B = {x : x ∈ A and x ∉ B}.

__Problem__ (R×Z)∩(Z×R)=Z×Z 

This is true. To see this, suppose (a,b)∈(R×Z)∩(Z×R). Then (a,b) ∈ R×Z, so b is an integer. Likewise, (a,b) ∈ Z×R, so a is an integer. Therefore, (a,b) ∈ Z×Z. Hence,(R×Z)∩(Z×R)⊆Z×Z. On the other hand, if (a,b) ∈ Z×Z, then a ∈ R, so (a,b) ∈ R×Z; likewise, b ∈ R, so (a,b) ∈ Z×R. Therefore, (a, b) ∈ (R × Z) ∩ (Z × R) and so Z × Z ⊆ (R × Z) ∩ (Z × R). Having proved containment both ways, it follows that (R × Z) ∩ (Z × R) = Z × Z.

__Problem__ (R×Z)∪(Z×R)=R×R 

This is false. To see this, notice that (π, π) ∈ R × R, but it’s definitely not the case that (π, π) ∈ R × Z, nor that (π, π) ∈ Z × R, so we see that (π, π) ∉ (R × Z) ∪ (Z × R).

__Problem__ Do you think the statement (R−Z)×N=(R×N)−(Z×N) is true, or false? Justify.
Solution https://math.stackexchange.com/q/3343980/299359

__Definition 1.6__ Let A be a set with a universal set U . The __complement__ of A,denoted A',istheset A'=U−A.
