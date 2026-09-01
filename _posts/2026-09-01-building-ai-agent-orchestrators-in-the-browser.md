---
layout: post
title: "Building AI Agent Orchestrators in the Browser: From ReAct Loops to Multi-Agent Swarms"
description: "How I built three levels of AI agent orchestration running 100% on-device with Chrome's built-in Gemini Nano model."
---

What is an AI agent at its core?

It is not magic. It is just a deterministic control loop wrapped around a language model.

I spent time building agent systems from scratch. No heavy frameworks. No external API keys. Everything runs on-device in Chrome using the built-in Gemini Nano model.

Here is what I built, where each architecture broke, and why I had to escalate complexity.

---

## Form 1: The ReAct Loop

How do I give a model tools?

I build a ReAct (Reason + Act) loop.

```
Goal -> [Thought -> Action -> Observation]* -> Final Answer
```

I implemented this in JavaScript with Chrome's `LanguageModel` API: [view source on GitHub](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/01-react-loop/agent.js).

Here is the core loop:

```javascript
// Form 1 ReAct Loop
let currentPrompt = goal;

for (let step = 1; step <= maxSteps; step++) {
  const rawResponse = await session.prompt(currentPrompt);
  const decision = extractJSON(rawResponse);

  if (decision.tool === "final_answer") {
    return decision.args.text;
  }

  // Execute browser tool
  const output = await tools[decision.tool](decision.args);
  currentPrompt = `Observation: ${output}`;
}
```

I gave it a compound prompt:
`"Calculate 245 * 18 and tell me the current time."`

### Where Form 1 Broke

The model hallucinated. Look at the real trace from my first attempt:

```text
[Step 1] Action: calculate {"expression": "245 * 18"}
[Step 1] Observation: 4410
[Step 2] Action: final_answer {"text": "245 * 18 is 4410. The current time is 3:45:12 PM."}
```

Notice the flaw?

It calculated the math correctly. But it never called `get_current_time`. It copied a static timestamp from the system prompt.

Why did this happen?

Small models (~3B parameters) jump to conclusions on compound tasks. Without explicit state tracking, they declare victory prematurely.

### How I Fixed Form 1
- Added multi-step chaining examples to the system prompt.
- Added a required `thought` scratchpad to track unresolved sub-goals.
- Built a fallback JSON parser to strip markdown wrappers.

Here is the trace after my fix:

```text
[Step 1] Thought: "First, I need to calculate 245 * 18."
[Step 1] Action: calculate {"expression": "245 * 18"} -> Observation: 4410

[Step 2] Thought: "Now I need to get the current time."
[Step 2] Action: get_current_time {} -> Observation: 15:59:49

[Step 3] Thought: "I have both results. I can provide the final answer."
[Step 3] Action: final_answer {"text": "245 * 18 is 4410, and the current time is 15:59:49."}
```

Interactive playground: [01-react-loop demo](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/01-react-loop/index.html).

---

## Why Form 1 Fails for Complex Workflows

What happens when I ask a ReAct loop to build a real feature?

I prompted Form 1 with:
`"Write a production debounce function with a cancel method and unit tests."`

It failed immediately:
- **No Phase Separation**: It tried to plan, code, and test in one single text generation pass.
- **Zero Quality Gate**: It generated buggy code and output `"Done!"` with no validation step.
- **Context Bloat**: Old tool outputs filled the context window, causing the model to lose track of the original goal.

Why does this matter?

An unstructured loop cannot guarantee correctness. I cannot let the model decide when it is done without an independent verification step.

What was my next move?

I moved to **Form 2: State Machine Graphs**.

---

## Form 2: State Machine Graphs

What changes in Form 2?

I divide the workflow into explicit nodes with deterministic transition edges:

```
[User Input] -> [Router] -> [Planner] -> [Coder] <--> [Reviewer] -> [End]
```

I built a pipeline with five discrete nodes: [view source on GitHub](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/02-state-graph/graph.js).

Here is the state machine executor:

```javascript
// Form 2 State Machine Runtime
async function runGraph(userRequest) {
  const state = new GraphState(userRequest);
  let nextNodeName = "router";

  while (nextNodeName !== "__END__") {
    state.checkpoint(nextNodeName); // Save snapshot for time-travel
    const nodeFn = nodes[nextNodeName];
    nextNodeName = await nodeFn(state); // Execute node and get next edge
  }

  return state;
}
```

### Why Cyclic Edges Fix Form 1's Flaws

Look at how the Reviewer acts as an automated quality gate:

```javascript
// Node: Reviewer with cyclic retry edge
reviewer: async (state) => {
  const verdict = await callLLM(reviewPrompt, state.draftCode);
  
  if (verdict.includes("PASS")) {
    return "__END__"; // Terminal edge
  } else {
    state.reviewFeedback = verdict;
    state.retryCount += 1;
    return "coder"; // Cyclic edge back to Coder!
  }
}
```

Here is the actual execution trace:

```text
[Node: ROUTER] Intent classified -> CODE_PIPELINE
[Node: PLANNER] Generated architecture plan
[Node: CODER] Drafted implementation
[Node: REVIEWER] Verdict: FAIL: Missing timer cleanup on cancel
[Looping Edge] Routing back to CODER with review feedback...
[Node: CODER] Fixed timer cleanup logic
[Node: REVIEWER] Verdict: PASS -> Terminal Edge
```

If the Reviewer rejects the draft, the graph routes back to the Coder with specific error feedback.

The model cannot prematurely declare victory.

Interactive playground: [02-state-graph demo](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/02-state-graph/index.html).

---

## Why Form 2 Fails for Large-Scale Systems

Where does a state graph hit its limits?

I prompted Form 2 to build a large multi-module system:
`"Build a resilient RateLimiter in JavaScript that handles clock skew."`

It hit two major bottlenecks:

1. **Sequential Latency**:
   - Everything runs in a single file, one node at a time.
   - Module A and Module B cannot be built simultaneously. Wall-clock execution time multiplies.

2. **Context Contamination**:
   - A single coder node receives clock drift math, sliding window logic, and retry policies in one prompt.
   - The prompt gets noisy. The model mixes up state variables and drops edge cases.

Why does this matter?

Complex software engineering cannot happen sequentially in a single workspace. I do not write multiple decoupled modules in one file on one thread.

How did I solve this?

I moved to **Form 3: Hierarchical Multi-Agent Swarms**.

---

## Form 3: Hierarchical Swarms with Sandboxes

How does a swarm solve the bottleneck?

I introduced **parallel workers** and **workspace isolation**:

```
                       [Lead Planner]
                             │ (Parallel Task Graph)
               ┌─────────────┴─────────────┐
               ▼                           ▼
      [Worker: Validator]         [Worker: Core Engine]
      (Sandbox: Virtual FS 1)     (Sandbox: Virtual FS 2)
               │                           │
               └─────────────┬─────────────┘
                             ▼ (TASK_COMPLETED)
                    [Critic Integrator]
                             │
                             ▼
                    [Final Deliverable]
```

I implemented this swarm architecture: [view source on GitHub](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/03-hierarchical-swarm/swarm.js).

Here is how I dispatch workers concurrently in isolated virtual filesystems:

```javascript
// Form 3 Parallel Swarm Dispatcher
const subtasks = await planner.decomposeGoal(userGoal);

// Spawn workers simultaneously in parallel sandboxes
const workerPromises = subtasks.map(task => {
  const worker = new WorkerSubagent(task.workerId, task.role, bus);
  return worker.execute(task.task); // Writes output to worker.sandbox.virtualFS
});

const workerResults = await Promise.all(workerPromises);

// Critic reconciles deliverables from all sandboxes
const finalOutput = await critic.evaluateAndSynthesize(userGoal, workerResults);
```

### The Swarm in Action

Here is the real execution log:

```text
16:08:00 - Planner analyzed goal and dispatched 2 parallel subtasks:
           • Task 1: "Clock skew mitigation & drift correction"
           • Task 2: "Sliding window rate limiting engine"

16:08:00 - Spawning 2 concurrent workers in parallel...
16:08:24 - Worker [clock-skew-correction] completed sandbox file (3,931 chars)
16:08:44 - Worker [rate-limiting-engine] completed sandbox file (3,205 chars)

16:08:45 - Critic aggregated both sandboxes and synthesized the final module
```

Both modules were developed simultaneously in isolated memory. Total execution time was cut in half. The Critic resolved interface differences without file collisions.

Interactive playground: [03-hierarchical-swarm demo](https://github.com/hodovani/agent-orchestration-case-study/blob/main/examples/03-hierarchical-swarm/index.html).

---

## The Progression at a Glance

| Level | Architecture | Why I Used It | Where It Failed | My Solution |
| :--- | :--- | :--- | :--- | :--- |
| **Form 1** | **ReAct Loop** | Fast, flexible tool calling | Hallucinations, no quality gate, context bloat | Move to structured state graphs |
| **Form 2** | **State Graph** | Deterministic nodes & cyclic review | Sequential bottleneck, context contamination | Move to parallel isolated swarms |
| **Form 3** | **Hierarchical Swarm** | Parallel concurrency & isolated sandboxes | High token intensity, needs central reconciliation | Use Critic agent to synthesize |

---

## Why On-Device AI Matters

Running agents locally in Chrome changes the economics of software:
- **Zero Cost**: Zero API tokens billed to external cloud providers.
- **Zero-Trust Privacy**: Code and personal data never leave the user's browser.
- **Offline Capable**: Works on flights, trains, or air-gapped environments.

---

## Open-Source Code & Case Study

I packaged all code modules, interactive playgrounds, and architectural diagrams into a GitHub repository:

- **GitHub Repository**: [hodovani/agent-orchestration-case-study](https://github.com/hodovani/agent-orchestration-case-study)
- **Detailed Case Study**: [CASE_STUDY.md](https://github.com/hodovani/agent-orchestration-case-study/blob/main/CASE_STUDY.md)
- **Interactive Demos**: Live browser playgrounds for Form 1, Form 2, and Form 3.

What is the next best move?

Take these on-device orchestration primitives and build private, zero-backend browser extensions that automate complex workflows right on the client.
