---
title: "How To Use Side Projects"
slug: "how-to-use-side-projects"
date: "2024-01-26"
displayDate: "Jan 26, 2024"
author: "@yahyaoncloud"
tags: ["Engineering", "Philosophy"]
summary: "Intentional constraints, technical exploration, and avoiding scope traps in infrastructure engineering."
---

I have found that there are two distinct motivations for side projects:

1. To build a solution to a problem
2. To use a new technology

I have also found that these two goals are often at odds with each other. When I want to learn a new technology, I am trying to learn a new way of thinking about problems. It's difficult to implement basic product needs when you're figuring out how to handle sorting a list in a new language.

Trying new things is important. There was a time 10 years ago when everybody's JavaScript looked different. Now we have many great ways to write JavaScript. Whether you prefer functional patterns or dependency injection and OOP, the tooling around those conventions borrows from other languages.

Neither of these motivations is misplaced. But it's difficult to keep track of both how the system maps to the business problem and how the technology maps to the system. Tackling more problems that are novel to you increases the surface area of the problem, while your capacity to solve it remains the same.

Most people are most effective at learning one thing at a time. It follows that the reason a lot of engineers don't finish side projects is because they're trying to learn too much at once. It's easy to get greedy and try to kill two birds with one stone. Similar to how there is always a higher priority, there is always something new to learn.

I approach side projects more effectively by applying as many constraints as possible and being intentional about one goal. Like all good work, focus is required.

When learning a new technology, I'll default to an app I've built before. Some examples include a Socket-based chat app, a simple CMS, or a cloud-backed distributed key-value store. The product problem is narrow. These systems have a low floor, making them great for learning.

If I am trying to build a product or write software to solve a problem, then design and architecture are where my energy goes.

You want to use a stack as boring as possible—a stack with no big 'if's. If you're most comfortable with PostgreSQL over DocumentDB, then use it. It should get out of the way.
