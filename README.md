# Aulas do Quarks

Slides das aulas teóricas gravadas do Quarks (OBS + Meet), um arquivo HTML por aula.

## Como usar no notebook do curso
1. Baixe o arquivo da aula em `saida/` (ex.: `saida/fisica/pism1/mu-1.html`) e abra no Chrome ou no Edge. Funciona sem internet: fontes e fórmulas vão dentro do arquivo (cópias em `vendor/`).
2. Aperte **F** para tela cheia e **G** para o modo gravação (tira o "CÂMERA" de dentro da moldura).
3. Aperte **N** para abrir as notas numa janela separada (só você vê).
4. No OBS, capture a janela do navegador e ponha a webcam em **X = 40, Y = 770, tamanho 480 x 270**.

## Atalhos
| Tecla | O que faz |
|---|---|
| → ou espaço | avança (um clique por vez) |
| ← | volta |
| N | notas do professor |
| D | caneta (1 a 4 trocam a cor; Z desfaz; C apaga tudo do slide) |
| E | nas questões: esconde o enunciado e a área de resolução ocupa a tela toda |
| B | tela de pausa |
| G | modo gravação |
| F | tela cheia |
| ? | ajuda |

## Organização
Cada subcapítulo é dividido em partes de cerca de 20 minutos ("Movimento uniforme · Parte 1 de 4"), na ordem da apostila do acompanhamento (veja `planejamento/cronograma.html`). No fim de cada capítulo há um bloco extra só com as questões do PISM daquele capítulo, com a área de resolução grande para o professor resolver.

## Para quem edita
`python3 build.py` monta todas as aulas em `saida/`. Regras em `CLAUDE.md`.
