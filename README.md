# 🎒 local.ai

A desktop app for local AI experimentation, model inference hosting, and note-taking.

It's made to be used alongside https://github.com/alexanderatallah/window.ai/ as a simple way to have a local inference server up and running in no time. window.ai + local.ai enable every web app to utilize AI without incurring any cost from either the developer or the user!

Right now, local.ai uses the https://github.com/rustformers/llm rust crate at its core. Check them out, they are super cool!

## 📺 Demo

<!-- https://github.com/louisgv/local.ai/assets/6723574/900f6d83-0867-4aa1-886a-e3c59b144864 -->
<video src="https://github.com/louisgv/local.ai/assets/6723574/ba4a04dc-5087-4725-b619-165ad774aedd" controls="controls" style="max-width: 470px;">
</video>

<!-- https://github.com/louisgv/local.ai/assets/6723574/c56400b4-4520-47da-80fb-ab8552a2683b
 -->

## 🧵 Development

Here's how to run the project locally:

### Prerequisites

1. node >= 18
2. rust >= 1.69
3. pnpm >= 8

### Workflow

```
git submodule update --init --recursive
pnpm i
pnpm dev
```

## 🪪 License

[GNU GPLv3](./LICENSE)

## 🤔 Trivia

### Why the backpack?

> Ties into the bring your own model concept -- Alex from window.ai

### Why GPLv3?

Anything AI-related including their derivatives should be open-source for all to inspect. GPLv3 enforces this chain of open-source.

### Is there a community?

- [GitHub discussion](https://github.com/louisgv/local.ai/discussions)
- Checkout this [poll](https://github.com/louisgv/local.ai/discussions/51)

### Where should I ask question?

- [Here](https://github.com/louisgv/local.ai/discussions/categories/q-a)

### Do you accept contribution/PR?

Absolutely - Please note that any contribution toward this repo shall be relicensed under GPLv3. There are many ways to contribute, such as:
- Documentation via wiki edit submission and known model documentation
- Testing and filing BUG issue
- For beginner, check out [Good First Issues](https://github.com/louisgv/local.ai/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- For seasoned developers, check out [Unassigned Help Wanted Issues](https://github.com/louisgv/local.ai/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+no%3Aassignee)
