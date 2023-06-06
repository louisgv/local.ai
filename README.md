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
pnpm i
pnpm dev
```

## 🛣️ Roadmap:

### Todo:

- Start as many inference endpoints/ports as needed

### Done:

- ~~Code signing, official binary release~~
- ~~Auto update server~~
- ~~LLM model downloader~~
- ~~Website with download links~~
- ~~(NTH): Automated release bundling~~

### Legends:

- NTH: Nice to have
- ~~item~~: Done

## 🪪 License

[GNU GPLv3](./LICENSE)

## 🤔 Trivia

### Why the backpack?

> Ties into the bring your own model concept -- Alex from window.ai

### Why GPLv3?

Anything AI-related including their derivatives should be open-source for all to inspect. GPLv3 enforces this chain of open-source.
