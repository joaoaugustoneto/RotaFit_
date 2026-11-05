# Relatório de Resolução de Problemas e Soluções Implementadas

Este documento serve como um registro técnico das dificuldades encontradas durante o desenvolvimento do aplicativo **RotaFit**, desenvolvido com React Native, Expo, TypeScript e Supabase. O objetivo é detalhar os erros, as análises técnicas de causa raiz e as exatas modificações de código realizadas para garantir a continuidade, estabilidade e fidelidade do projeto ao guia oficial.

---

### 1. Testes do Banco de Dados: Arquivo de Schema Não Encontrado

#### Descrição do Erro

Durante a execução dos testes locais de banco de dados (`pnpm test:db`), o processo falhou indicando que o arquivo `schema.sql` não pôde ser encontrado pelo script do PGlite.

#### Análise Técnica

A causa raiz foi um erro de nomenclatura durante a criação do arquivo. O script de testes (`supabase/tests/db.test.mjs`) foi programado para ler `schema.sql`, mas o arquivo físico no projeto havia sido salvo acidentalmente como `scheme.sql`.

#### Como a Solução foi Implementada

A correção foi realizada diretamente no sistema de arquivos, renomeando o arquivo de `supabase/scheme.sql` para `supabase/schema.sql`.

#### Resultado

Após a correção, a execução do comando `pnpm test:db` funcionou perfeitamente, validando o banco com **11 testes aprovados**.

---

### 2. Conflito de Execução do Jest com ES Modules (Testes do Supabase)

#### Descrição do Erro

Ao executar a suíte de testes do frontend com `pnpm test:app`, o Jest tentou ler o arquivo `supabase/tests/db.test.mjs` e falhou por incompatibilidade de módulo, acusando que a sintaxe ESM nativa não poderia ser executada naquele ambiente.

#### Análise Técnica

O padrão de captura de arquivos de teste do Jest estava abrangendo a pasta `/supabase/` porque o arquivo terminava em `*.test.mjs`. Como os testes de banco foram projetados para rodar via *test runner* nativo do Node (`node:test`), o Jest interveio indevidamente onde não devia atuar.

#### Como a Solução foi Implementada

No arquivo de configuração raiz `package.json`, foi adicionada a regra de ignorar caminhos no bloco de configuração do Jest:

```json
"testPathIgnorePatterns": [
  "<rootDir>/supabase/"
]

```

#### Resultado

O Jest passou a ignorar a pasta do backend, isolando os testes do frontend com sucesso. Ambas as suítes passaram a funcionar de forma totalmente independente.

---

### 3. Ajustes de Conformidade Estrutural ao Guia

#### Descrição do Erro

Foram identificados múltiplos desvios menores na estrutura de arquivos, scripts de automação e regras de versionamento que feriam o padrão esperado pelo projeto.

#### Análise Técnica

Os problemas englobavam caminhos errados no formatador de código, falta de mapeamento de tipagem global, arquivos residuais de template do Expo e regras falhas de proteção de chaves de API no `.gitignore`.

#### Como a Solução foi Implementada

As seguintes modificações pontuais foram consolidadas:

* **Scripts do `package.json**`: O comando `"format"` foi corrigido de `_tests_` para `"prettier --write app src __tests__ supabase/tests"`.
* **`tsconfig.json`**: Adicionados os caminhos `.expo/types/**/*.ts` e `expo-env.d.ts` no array `"include"`.
* **Limpeza**: Removidos os arquivos residuais `App.tsx` e `index.ts` da raiz do projeto (substituídos pela navegação via `app/`).
* **Segurança**: Renomeado `.env.exemple` para `.env.example` e adicionada uma seção de proteção rigorosa no `.gitignore` para ignorar `.env` e `.env.*`.

#### Resultado

Estrutura padronizada, formatação de código totalmente funcional e variáveis de ambiente isoladas contra commits acidentais.

---

### 4. Etapa 7: Tipagem Inexistente de `expo-auth-session/build/QueryParams`

#### Descrição do Erro

O TypeScript (`tsc`) apresentou um erro na Etapa 7 indicando não reconhecer o subcaminho `expo-auth-session/build/QueryParams`.

#### Análise Técnica

O pacote `expo-auth-session` no Expo SDK 58 restringe o mapa de exportações (`"exports"`) em seu `package.json`. Como resultado, a importação direta de arquivos de compilação interna (pasta `/build/`) deixou de ser exposta publicamente para o compilador do TypeScript.

#### Como a Solução foi Implementada

Foi criada uma declaração de tipos ambiente (*ambient declaration*) especificamente para cobrir esse gap da biblioteca. O arquivo `src/types/expo-auth-session.d.ts` foi gerado para mapear os tipos ausentes.

#### Resultado

O erro de compilação foi sanado e o TypeScript passou a validar a importação de `QueryParams` corretamente.

---

### 5. Etapa 11: Incompatibilidade de Tipo em `ColorValue` no `tabIcon`

#### Descrição do Erro

No arquivo de configuração das abas, a tipagem estrita rejeitou a atribuição do tipo `ColorValue` à propriedade `color` do componente `<Ionicons/>`.

#### Análise Técnica

Com as atualizações recentes, `ColorValue` no React Native 0.88 passou a ser uma união de tipos que inclui `null`. A propriedade `color` da biblioteca de ícones exige estritamente `string | undefined`.

#### Como a Solução foi Implementada

A assinatura da função `tabIcon` foi mantida intacta (`color: ColorValue`), mas o repasse do valor foi encapsulado com uma validação segura de tipo em tempo de execução:

```tsx
color={typeof color === 'string' ? color : undefined}

```

#### Resultado

Tipagem sanada em conformidade com as regras estritas (`strict: true`) sem a necessidade de recorrer a `any` ou `ts-ignore`.

---

### 6. Etapa 12: Retorno Incompatível de `refetch()` no `RefreshControl`

#### Descrição do Erro

O componente `RefreshControl` apontava erro de tipagem no evento `onRefresh`.

#### Análise Técnica

A propriedade `onRefresh` do React Native exige que a função de callback retorne exclusivamente `void`. No entanto, o método `refetch` fornecido pelo TanStack Query v5 retorna uma `Promise` contendo os resultados da consulta.

#### Como a Solução foi Implementada

No arquivo `app/(app)/(tabs)/index.tsx`, a chamada direta ao método foi substituída por uma *arrow function* que descarta explicitamente o retorno da Promise:

```tsx
onRefresh={() => { refetch(); }}

```

#### Resultado

A incompatibilidade foi contornada e o `RefreshControl` passou a funcionar de forma silenciosa e sem avisos de tipagem.

---

### 7. Aviso (WARN) do Metro Bundler sobre Exportações Restritas

#### Descrição do Erro

Durante a compilação do bundle, o Metro exibia no terminal o aviso: `WARN: expo-auth-session/build/QueryParams`.

#### Análise Técnica

Tratava-se apenas de um alerta (não bloqueante) originado pela mesma restrição de `"exports"` citada no Item 4. O Metro Bundler emitia o alerta, mas já executava um *fallback* automático buscando o arquivo diretamente no disco.

#### Como a Solução foi Implementada

Sendo um aviso exclusivamente informativo que não impedia a execução nem a compilação final do aplicativo, ele foi mapeado e ignorado propositalmente, dispensando intervenções de código.

#### Resultado

Monitoramento estabelecido; o comportamento da aplicação não sofre qualquer impacto.

---

### 8. Erro de DNS no Supabase (`DNS_PROBE_POSSIBLE`)

#### Descrição do Erro

Ao acionar o botão "Continuar com Google", o fluxo de autenticação falhava imediatamente e o navegador exibia o erro de conectividade `DNS_PROBE_POSSIBLE`.

#### Análise Técnica

Houve um erro de digitação no cadastro do subdomínio dentro do arquivo de variáveis de ambiente (`.env`). Faltou a letra `q` no identificador único do projeto Supabase (`kfpavjkymnrfpzyhure` ao invés do correto `kfpavjkymnqrfpzyhure`), direcionando as requisições do app para um servidor inexistente.

#### Como a Solução foi Implementada

A variável `EXPO_PUBLIC_SUPABASE_URL` foi corrigida no `.env` com a string exata do projeto. Logo em seguida, o servidor de desenvolvimento do Expo foi encerrado e reiniciado com a flag de limpeza de cache (`pnpm start -c`) para injetar a nova URL.

#### Resultado

O redirecionamento via OAuth foi restabelecido e a autenticação com o Google voltou a funcionar.

---

### 9. Erro de Redirecionamento do Spotify OAuth (`redirect_uri: Not matching configuration`)

#### Descrição do Erro

Ao utilizar o botão "Conectar Spotify", a API do Spotify bloqueava o login exibindo `redirect_uri: Not matching configuration`. No painel de desenvolvedor do Spotify, não era possível cadastrar a URI com a palavra `localhost`.

#### Análise Técnica

As diretrizes de segurança atualizadas do Spotify (baseadas na RFC 8252 do IETF) proíbem terminantemente o uso da string `localhost` nos redirecionamentos para prevenir ataques do tipo *DNS rebinding*. Ao invés disso, a plataforma exige obrigatoriamente o uso do IP de loopback explícito (`127.0.0.1`).

#### Como a Solução foi Implementada

Duas frentes de atuação foram abertas:

1. **No Código (`src/context/SpotifyContext.tsx`)**: Implementada uma normalização automática para ambientes Web. Qualquer URI gerada que apontasse para `localhost` passou a ser reescrita em tempo real para `127.0.0.1` (`[http://127.0.0.1:8081/spotify-auth](http://127.0.0.1:8081/spotify-auth)`). Adicionou-se também a captura automática do popup via `WebBrowser.maybeCompleteAuthSession()`.
2. **No Dashboard do Spotify**: O ambiente de redirecionamento foi configurado explicitamente com as URIs obrigatórias: `[http://127.0.0.1:8081/spotify-auth](http://127.0.0.1:8081/spotify-auth)`, `[http://127.0.0.1:8081](http://127.0.0.1:8081)` e o deep link mobile `rotafit://spotify-auth`.

#### Resultado

O fluxo PKCE da Web API do Spotify passou a autorizar as requisições corretamente, permitindo que o app obtivesse e armazenasse os tokens do usuário.

---

### 10. Bug Visual do Tema (Quebra de Contraste e Telas sem Cor de Fundo)

#### Descrição do Erro

Durante os testes de interface, falhas de legibilidade e estilo foram notadas. Na tela de Início, o texto "Pronto para correr?" estava invisível. Na tela de Perfil, os cartões escuros pareciam flutuar sem contexto sobre um fundo inteiramente branco. Ao alternar para o "Tema Escuro", os textos mudavam para a paleta clara (correta), mas o fundo das telas não respondia e continuava branco.

#### Análise Técnica

O contexto de tema global `theme.background` foi implementado no projeto, mas não havia sido atrelado às camadas base da navegação. O `Chrome` raiz, as abas (`Tabs`), as pilhas (`Stack`) e as tags pai das telas (`ScrollView`, `FlatList`, `View`) não possuíam a cor de fundo declarada nos seus estilos, herdando a cor padrão do sistema operacional em vez da paleta do provedor `ThemeProvider`.

#### Como a Solução foi Implementada

A propriedade `backgroundColor: theme.background` foi propagada para todas as bases de tela:

* **`app/_layout.tsx`**: Configurado fundo no contêiner base `Chrome` e adicionado `contentStyle` nas propriedades do `<Stack>`.
* **`app/(app)/(tabs)/_layout.tsx`**: Aplicado `sceneStyle` no navegador `<Tabs>`.
* **Telas Individuais (`index.tsx`, `profile.tsx`, `history.tsx`)**: Injetado via folha de estilo global com `flex: 1` nos containers raízes.
* Adicionalmente, na tela de corrida ativa, o `outlineStyle: 'none'` foi aplicado para remover bordas indesejadas de foco no navegador (Web).

#### Resultado

A interface passou a respeitar 100% da identidade visual pretendida. A alternância entre claro e escuro funcionou de ponta a ponta sem quebras de contraste, com a compilação finalística passando sem erros (41/41 testes aprovados, `pnpm typecheck` com 0 ocorrências).