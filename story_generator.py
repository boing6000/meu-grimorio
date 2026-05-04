#!/usr/bin/env python3
"""Gerador de histórias interativo via CLI usando Ollama."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Callable
from pathlib import Path
from urllib import error, request

DEFAULT_HOST = "http://localhost:11434"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\-\s]", "", value)
    value = re.sub(r"\s+", "-", value)
    return value or "historia"


def prompt_yes_no(question: str, default_yes: bool = True) -> bool:
    suffix = "[S/n]" if default_yes else "[s/N]"
    while True:
        answer = input(f"{question} {suffix}: ").strip().lower()
        if not answer:
            return default_yes
        if answer in {"s", "sim", "y", "yes"}:
            return True
        if answer in {"n", "nao", "não", "no"}:
            return False
        print("Resposta inválida. Digite 's' ou 'n'.")


def ask_int(question: str, minimum: int = 1) -> int:
    while True:
        raw = input(f"{question}: ").strip()
        try:
            value = int(raw)
            if value < minimum:
                raise ValueError
            return value
        except ValueError:
            print(f"Informe um número inteiro maior ou igual a {minimum}.")


def safe_generate(
    client: "OllamaClient",
    *,
    prompt: str,
    temperature: float,
    stream: bool,
) -> str:
    while True:
        try:
            return client.generate(
                prompt,
                temperature=temperature,
                stream=stream,
                on_token=stream_to_console if stream else None,
            )
        except RuntimeError as exc:
            if stream:
                print()
            print(f"\nFalha ao gerar conteúdo: {exc}")
            if not prompt_yes_no("Deseja tentar novamente com o mesmo prompt?"):
                raise


class OllamaClient:
    def __init__(self, host: str, model: str):
        self.host = host.rstrip("/")
        self.model = model

    def generate(
        self,
        prompt: str,
        temperature: float = 0.8,
        stream: bool = False,
        on_token: Callable[[str], None] | None = None,
    ) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream,
            "options": {"temperature": temperature},
        }
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(
            f"{self.host}/api/generate",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=600) as resp:
                if stream:
                    chunks: list[str] = []
                    for raw_line in resp:
                        line = raw_line.decode("utf-8").strip()
                        if not line:
                            continue
                        part = json.loads(line)
                        token = part.get("response", "")
                        if token:
                            chunks.append(token)
                            if on_token is not None:
                                on_token(token)
                        if part.get("done"):
                            break
                    text = "".join(chunks).strip()
                else:
                    body = json.loads(resp.read().decode("utf-8"))
                    text = body.get("response", "").strip()
        except error.URLError as exc:
            raise RuntimeError(f"Erro ao conectar no Ollama em {self.host}: {exc}") from exc

        if not text:
            raise RuntimeError("O Ollama não retornou conteúdo.")
        return text


def stream_to_console(token: str) -> None:
    print(token, end="", flush=True)


def build_structure(client: OllamaClient, idea_text: str, stream: bool = False) -> str:
    prompt = f"""
You are a creative writing assistant. Based on the story idea below, provide:
1) A suggested title.
2) A 5-8 line synopsis.
3) A narrative structure in bullet points.

Base idea:
{idea_text}
""".strip()
    return safe_generate(client, prompt=prompt, temperature=0.7, stream=stream)


def build_chapter_idea(client: OllamaClient, structure: str, chapter_n: int, total: int, stream: bool = False) -> str:
    prompt = f"""
Based on the structure below, propose the concept for chapter {chapter_n} of {total}.
Include: dramatic goal, conflict, turning point, and ending hook.

Structure:
{structure}
""".strip()
    return safe_generate(client, prompt=prompt, temperature=0.75, stream=stream)


def write_chapter(client: OllamaClient, structure: str, chapter_plan: str, chapter_n: int, stream: bool = False) -> str:
    prompt = f"""
Write chapter {chapter_n} in Markdown, with strong narrative pacing and dialogue when appropriate.
Use the plan below as guidance.

Overall structure:
{structure}

Chapter plan:
{chapter_plan}
""".strip()
    return safe_generate(client, prompt=prompt, temperature=0.85, stream=stream)


def parse_title_from_structure(structure: str) -> str:
    for line in structure.splitlines():
        cleaned = line.strip().lstrip("-*")
        if "título" in cleaned.lower() and ":" in cleaned:
            return cleaned.split(":", 1)[1].strip()
    return "minha-historia"


def main() -> int:
    parser = argparse.ArgumentParser(description="Gerador de histórias com Ollama")
    parser.add_argument("idea_file", help="Caminho para TXT com ideia geral da história")
    parser.add_argument("--host", default=os.environ.get("OLLAMA_HOST", DEFAULT_HOST), help="Host do Ollama")
    parser.add_argument("--model", default="llama3.1", help="Modelo no Ollama")
    parser.add_argument("--stream", action="store_true", help="Mostra geração token a token no console")
    args = parser.parse_args()

    idea_path = Path(args.idea_file)
    if not idea_path.exists():
        print(f"Arquivo não encontrado: {idea_path}")
        return 1

    idea_text = idea_path.read_text(encoding="utf-8").strip()
    if not idea_text:
        print("Arquivo de ideia está vazio.")
        return 1

    client = OllamaClient(args.host, args.model)

    print("\nGerando estrutura inicial...\n")
    structure = build_structure(client, idea_text, stream=args.stream)
    if args.stream:
        print()
    else:
        print(structure)

    while not prompt_yes_no("Você aprova essa estrutura?"):
        feedback = input("Descreva o que deve mudar na estrutura: ").strip()
        structure = safe_generate(
            client,
            prompt=f"Rewrite the structure below considering this feedback: {feedback}\n\nCurrent structure:\n{structure}",
            temperature=0.7,
            stream=args.stream,
        )
        print("\nNova estrutura:\n")
        if args.stream:
            print()
        else:
            print(structure)

    chapters = ask_int("Quantos capítulos você deseja")
    title = parse_title_from_structure(structure)
    story_dir = Path("storias") / slugify(title)
    story_dir.mkdir(parents=True, exist_ok=True)

    for chapter_n in range(1, chapters + 1):
        print(f"\n--- Capítulo {chapter_n}/{chapters} ---")
        chapter_plan = build_chapter_idea(client, structure, chapter_n, chapters, stream=args.stream)
        print("\nIdeia do capítulo:\n")
        if args.stream:
            print()
        else:
            print(chapter_plan)

        while not prompt_yes_no("Aceita essa ideia de capítulo?"):
            feedback = input("O que deve mudar na ideia deste capítulo? ").strip()
            chapter_plan = safe_generate(
                client,
                prompt=f"Rewrite the chapter {chapter_n} concept considering this feedback: {feedback}\n\nCurrent chapter concept:\n{chapter_plan}",
                temperature=0.75,
                stream=args.stream,
            )
            print("\nNova ideia do capítulo:\n")
            if args.stream:
                print()
            else:
                print(chapter_plan)

        chapter_text = write_chapter(client, structure, chapter_plan, chapter_n, stream=args.stream)
        print("\nCapítulo gerado:\n")
        if args.stream:
            print()
        else:
            print(chapter_text)

        while not prompt_yes_no("O capítulo está como você quer?"):
            feedback = input("Quais alterações você deseja neste capítulo? ").strip()
            chapter_text = safe_generate(
                client,
                prompt=f"Rewrite chapter {chapter_n} considering this feedback: {feedback}\n\nCurrent chapter draft:\n{chapter_text}",
                temperature=0.85,
                stream=args.stream,
            )
            print("\nCapítulo revisado:\n")
            if args.stream:
                print()
            else:
                print(chapter_text)

        out_file = story_dir / f"chapter_{chapter_n}.md"
        out_file.write_text(chapter_text + "\n", encoding="utf-8")
        print(f"Capítulo salvo em: {out_file}")

    print("\nProcesso finalizado com sucesso!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
