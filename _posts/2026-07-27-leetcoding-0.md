# Daily LeetCode Practice & Key Learnings

## [217. Contains Duplicate](https://leetcode.com/problems/contains-duplicate/description/) | [Watch Video](https://youtu.be/2o0AINvxawg)
- **Data Structure Choice:** Use a `Set` for $O(1)$ average-time lookups to trade a small amount of auxiliary space for speed.
- **Early Exit:** Checking `set.has(num)` inside an iterative loop allows an immediate early exit on the first duplicate, whereas `new Set(nums).size !== nums.length` forces full $O(N)$ allocation and execution every time.
- **Clean Syntax:** Prefer `for (const num of nums)` over indexed `for (let i = 0...)` loops when array indices are not explicitly required.

---

## [242. Valid Anagram](https://leetcode.com/problems/valid-anagram/description/) | [Watch Video](https://youtu.be/6GsBIM84lKM)
- **Loop Bounds Safety:** Always verify loop boundaries match the target data structure. Iterating up to `s.length` instead of the fixed frequency array size (26) leads to array-out-of-bounds checks or false positives.
- **Space Optimization:** A single 26-element array can be used instead of two separate counter arrays by incrementing counts for string `s` and decrementing for string `t`.
- **Unicode Flexibility:** Fixed-size arrays (26 buckets) only work for ASCII lowercase letters. For full UTF-8/emoji support, transition to a `Map<char, number>`.

---

## [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/description/) | [Watch Video](https://youtu.be/QRueEXHt6z4)
- **Hashing Strategy:** Character frequency arrays can be converted to unique string keys (e.g., `"1#0#2..."`) to group anagrams in $O(N \cdot K)$ time without sorting strings $(O(N \cdot K \log K))$.
- **In-Place Mutation:** Avoid spreading arrays inside loops (`[...oldValue, item]`), as shallow copying creates an $O(M)$ overhead per insert. Using `map.get().push(item)` directly mutates in $O(1)$ amortized time.
- **Complexity Analysis:** Separate string count ($N$) from individual string length ($K$). Total runtime is $O(N \cdot K)$, not $O(N^2)$.

---

## [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/description/) | [Watch Video](https://youtu.be/kmXiYU0fdlI)
- **Two-Pointer Pattern:** Moving `left` and `right` pointers toward the center allows in-place $O(1)$ space verification without making modified string copies.
- **Inner Loop Safety:** When using inner `while` loops to skip non-alphanumeric characters, always include boundary guards (`left < right`) to prevent infinite loops (TLE) or out-of-bounds pointer movement.
