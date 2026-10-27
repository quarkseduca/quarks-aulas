# Instruções para quem edita este repositório (Claude, Codex, GPT ou pessoa)

- **O nome é masculino: "o Quarks".** Antes de tudo, leia o cérebro do Quarks (`quarkseduca/quarks-cerebro`).
- Este repositório guarda os **slides das aulas teóricas gravadas** (OBS + Meet) do Quarks. Material exclusivo: nada de dado de aluno; não publique em site nenhum.
- Disciplinas: Física, Química, Matemática e Português. Densidade de texto: Física e Química médio, Matemática mínimo, Português completo.
- Estrutura: `motor/` (visual e teclas, igual para todas as aulas), `aulas/<disciplina>/<curso>/<aula>.html` (só os slides), `marca/` (símbolo e logo). `python3 build.py` monta cada aula num arquivo único em `saida/`, que é o que o professor abre no navegador.
- Conteúdo sai da apostila do curso no cérebro (`apostilas/<curso>/<disciplina>/`) e das questões do banco. Nada de dado inventado.
- Tela de vídeo 1920x1080. **O canto inferior esquerdo é da câmera** (480x270 a 40 px das bordas; no OBS, X = 40, Y = 770). Nenhum conteúdo abaixo de y = 720 à esquerda de x = 620.
- Visual: roxo do Quarks como base e a cor da disciplina como acento (`data-disc` no palco). Bricolage Grotesque nos títulos, Figtree no texto. Animações só com função, lentas; revelação por clique com `data-passo`.
- Trabalhe em branch; o dono decide quando juntar no `main`.
