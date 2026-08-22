---
title: "Refactors and Overfitting"
slug: "refactors-and-overfitting"
date: "2024-01-29"
displayDate: "Jan 29, 2024"
author: "@yahyaoncloud"
tags: ["Architecture", "Refactoring"]
summary: "Why premature abstraction is just statistical overfitting applied to software systems."
---

Refactoring is often discussed as an unmitigated good. The common wisdom tells us to extract duplicate logic, build reusable modules, and maintain dry abstractions.

However, extracting abstractions too early often leads to what statisticians call *overfitting*: fitting a model too closely to the existing sample data points at the expense of generalizing to new, unseen requirements.

### The Cost of Premature Abstraction

When you create a shared helper function based on two slightly similar use cases, you bind those two disparate business requirements together. Inevitably, the third usecase requires a parameter flag:

```typescript
function processClusterDeployment(config: ClusterConfig, isLegacy: boolean = false) {
  if (isLegacy) {
    // Branching logic begins to pollute the abstraction
  }
}
```

Duplication is far cheaper than the wrong abstraction. Until you have three independent call sites with identical constraints, inline repetition remains clearer, more observable, and easier to refactor later.
