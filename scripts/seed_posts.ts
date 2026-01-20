
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Ensure at least one admin user exists (optional, but good for local dev)
  // Skipping strict user creation for now to focus on content, assuming auth handles user creation/mapping.
  
  // 2. Create a default author if none exists
  let author = await prisma.author.findFirst();
  if (!author) {
    console.log('Creating default author...');
    author = await prisma.author.create({
      data: {
        email: 'admin@yahyaoncloud.com',
        authorId: 'admin-123', // required unique ID
        authorName: 'Yahya',
        username: 'yahya',
        password: 'placeholder', // Auth handled by Firebase
        role: 'admin',
        description: 'Cloud Architect and Full Stack Developer.',
        avatar: '/default-avatar.png'
      }
    });
  }

  // 3. Create a Welcome Post
  const welcomeSlug = 'welcome-to-yahyaoncloud';
  const existingPost = await prisma.post.findUnique({ where: { slug: welcomeSlug } });

  if (!existingPost) {
    console.log('Creating "Welcome" post...');
    await prisma.post.create({
      data: {
        title: 'Welcome to YahyaOnCloud',
        slug: welcomeSlug,
        content: `
# Welcome to YahyaOnCloud!

This is the first post on the new platform. 

## What to expect?
- Deep dives into Cloud Architecture (Azure, AWS)
- Full Stack Development tutorials (Remix, React, Node.js)
- Career advice for aspiring Cloud Engineers

Stay tuned for more updates!
        `.trim(),
        summary: 'The official launch post for YahyaOnCloud blog platform.',
        authorId: author.id,
        status: 'published', // IMPORTANT: Must be 'published' to show up
        type: 'ARTICLE',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
        date: new Date(),
        minuteRead: 1,
        featured: true
      }
    });
    console.log('✅ Welcome post created.');
  } else {
    console.log('ℹ️ Welcome post already exists.');
  }

  // 4. Create Ansible Post
  const ansibleSlug = 'what-the-heck-is-ansible-anyways';
  const existingAnsible = await prisma.post.findUnique({ where: { slug: ansibleSlug } });
  
  if (!existingAnsible) {
    console.log('Creating "Ansible" post...');
    await prisma.post.create({
      data: {
        title: 'What the heck is Ansible anyways?',
        slug: ansibleSlug,
        content: `
# What the heck is Ansible anyways?

Ansible is an open-source automation tool, or as I like to call it, "the thing that saves you from typing the same commands on 50 servers."

## Why Use It?
- **Agentless**: No software to install on the target nodes. It uses SSH.
- **Simple**: Uses YAML for playbooks, which is (mostly) human-readable.
- **Powerful**: Can configure systems, deploy software, and orchestrate more advanced IT tasks.

## Code Example
Here is a simple task to install Nginx:

\`\`\`yaml
- name: Install Nginx
  apt:
    name: nginx
    state: present
\`\`\`

It's that simple!
        `.trim(),
        summary: 'A beginner-friendly introduction to Ansible automation.',
        authorId: author.id,
        status: 'published',
        type: 'ARTICLE',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop', 
        date: new Date(),
        minuteRead: 5,
        featured: false
      }
    });
    console.log('✅ Ansible post created.');
  }

  // 5. Create Go Post
  const goSlug = 'starting-with-go-programming';
  const existingGo = await prisma.post.findUnique({ where: { slug: goSlug } });

  if (!existingGo) {
    console.log('Creating "Go" post...');
    await prisma.post.create({
      data: {
        title: 'Starting with Go Programming',
        slug: goSlug,
        content: `
# Starting with Go Programming

Go (or Golang) is Google's answer to the complexities of C++ and Java. It is statically typed, compiled, and incredibly fast.

## Key Features
1. **Concurrency**: Goroutines make concurrent programming easy.
2. **Speed**: Compiles to machine code.
3. **Simplicity**: Minimalistic syntax.

## Hello World

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

If you are looking to build scalable microservices, Go is your friend.
        `.trim(),
        summary: 'Deep dive into Golang basics and why it is the language of the cloud.',
        authorId: author.id,
        status: 'published',
        type: 'ARTICLE',
        coverImage: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?q=80&w=2670&auto=format&fit=crop',
        date: new Date(),
        minuteRead: 8,
        featured: true
      }
    });
    console.log('✅ Go post created.');
  }

  console.log('🌱 Seeding completed.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
