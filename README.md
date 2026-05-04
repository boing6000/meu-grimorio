# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Gerador de histórias (Python + Ollama)

Script: `story_generator.py`

### Uso

```bash
python3 story_generator.py caminho/para/ideia.txt --host http://localhost:11434 --model llama3.1
```

Também é possível definir o host por variável de ambiente:

```bash
export OLLAMA_HOST=http://localhost:11434
python3 story_generator.py caminho/para/ideia.txt --model llama3.1
```

O fluxo é interativo: estrutura -> revisão -> capítulos -> revisão final de cada capítulo.
Os capítulos aprovados são salvos em `storias/[titulo]/chapter_[n].md`.
