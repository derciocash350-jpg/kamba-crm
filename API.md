# API do Kamba CRM

Endereço base: `https://dywzfjrisvgkujamueql.supabase.co/functions/v1/api`

Todos os pedidos precisam da chave secreta no cabeçalho `x-api-key`.
A chave dá acesso a todos os dados. Guarda-a só em servidores ou sistemas de confiança e nunca no site.

## Recursos

| Recurso | Campos |
|---|---|
| `contactos` | `nome` (obrigatório), `empresa`, `cargo`, `email`, `tel`, `cidade`, `estado` (`Lead`, `Cliente`, `Inativo`), `notas`, `responsavel` |
| `negocios` | `titulo` (obrigatório), `contacto_id`, `valor`, `etapa` (`novo`, `qual`, `prop`, `neg`, `ganho`, `perdido`), `fecho` (AAAA-MM-DD), `notas`, `responsavel` |
| `tarefas` | `titulo` (obrigatório), `contacto_id`, `data` (AAAA-MM-DD), `feito` (true/false), `responsavel` |

`responsavel` é o email da pessoa responsável. Se não o indicares, o registo fica sem responsável e só administradores e gestores o veem.
Cada registo devolve também `id` e `criado_em`.

## Pedidos

- `GET /contactos` lista registos. Parâmetros: `limite` (1 a 100, por defeito 50), `offset`, `busca`, e filtros como `estado`, `etapa`, `feito`, `contacto_id`, `responsavel`.
- `GET /contactos/{id}` devolve um registo.
- `POST /contactos` cria um registo (corpo JSON).
- `PATCH /contactos/{id}` altera só os campos enviados.
- `DELETE /contactos/{id}` elimina o registo.

A resposta de listagem tem a forma `{"dados": [...], "total": 12, "limite": 50, "offset": 0}`.
Erros vêm como `{"erro": "mensagem"}` com o código HTTP adequado (400, 401, 404, 405, 413).

## Exemplos

```bash
KEY="a_tua_chave"
BASE="https://dywzfjrisvgkujamueql.supabase.co/functions/v1/api"

# listar leads
curl "$BASE/contactos?estado=Lead" -H "x-api-key: $KEY"

# criar contacto
curl -X POST "$BASE/contactos" -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{"nome":"Rita Santos","empresa":"Loja Azul","email":"rita@lojaazul.example","estado":"Lead","responsavel":"vendedor@empresa.ao"}'

# mover negócio para Negociação
curl -X PATCH "$BASE/negocios/ID_DO_NEGOCIO" -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{"etapa":"neg"}'
```
