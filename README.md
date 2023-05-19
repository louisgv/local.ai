# local.ai

A desktop app for hosting an inference API on your local machine. Binary distribution will be released soon once Code Signing is set up. If you're experienced in this matter, feel free to reach out!

It's made to be used alongside https://github.com/alexanderatallah/window.ai/ as a simple way to have a local inference server up and running with just the model files.

Right now, local.ai uses the https://github.com/rustformers/llm rust crate at the core. Check them out, they are super cool!

## Demo

<video src="https://github.com/louisgv/local.ai/assets/6723574/900f6d83-0867-4aa1-886a-e3c59b144864" controls="controls" style="max-width: 470px;">
</video>


## Development

Here's how to run the project locally:

### Prerequisites

1. node >= 18
2. rust >= 1.69
3. pnpm >= 8

### Workflow

```
pnpm i
pnpm dev:desktop
```

## Roadmap:

- Code signing, official binary release
- Auto update server
- LLM model downloader
- Start as many inference endpoints/ports as needed
- Website with download links
- (NTH): Automated release bundling

> NTH: Nice to have

## License

MIT
