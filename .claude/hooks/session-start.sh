#!/bin/bash
# Início de sessão: liga a trava do push (scripts/ganchos/pre-push), que roda scripts/verificar_tudo.py antes de qualquer push para o main.
# Este repositório não tem dependências de pacotes (só python3; node, se houver, confere a sintaxe do JavaScript).
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if [ -d .git ] || [ -f .git ]; then
  [ "$(git config core.hooksPath 2>/dev/null)" = "scripts/ganchos" ] || git config core.hooksPath scripts/ganchos || true
fi
command -v python3 >/dev/null 2>&1 || echo "aviso: python3 ausente (build.py e a verificação não rodam)" >&2
exit 0
