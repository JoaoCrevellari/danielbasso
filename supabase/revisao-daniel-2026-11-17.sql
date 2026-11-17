-- Revisão do Daniel de 17/11/2026: capas reais, contracapas, Nada Pode Me Deter como 'uma história real' e o 4º livro, Ruptura.
-- Gerado a partir de scripts/exemplo/livros-depoimentos.ts.
begin;
insert into content_items (collection, slug, title, subtitle, excerpt, body, cover_url, status, featured, sort_order, data, published_at)
values ($t$livro$t$, $t$as-leis-do-autogoverno$t$, $t$As Leis do Autogoverno$t$, $t$Os princípios que dão forma a uma vida$t$, $t$O fundamento de todo o método: por que algumas vidas se ordenam e outras se desfazem, e o que cabe a você governar.$t$, $t$Governo é o princípio que dá unidade, direção e ordem a uma vida. Quando ele está fora de você, a vida toma a forma do que está fora: o medo, a culpa, a urgência dos outros. Quem não governa a si mesmo é governado pelas circunstâncias.

Neste livro, Daniel Basso reúne a tradição clássica da formação humana, de Agostinho à filosofia concreta de Mário Ferreira dos Santos, e a traduz em leis práticas para quem tem casa, trabalho e família para governar.

## O que você vai encontrar

- O que é governar a si mesmo
- A diferença entre controle, rigidez e autogoverno
- Ser, ter e fazer: a ordem que sustenta uma vida
- Por que a ordem dos afetos decide o rumo de tudo$t$, $t$/livros/capa-as-leis-do-autogoverno.webp$t$, 'published', false, 1, $t${"situacao":"em-breve","cor":"petroleo","ano":"2026","editora":"Edições Attos","paginas":null,"isbn":"","etapa":"clareza","trecho":"Toda vida assume a forma daquilo que a governa.","sumario":"O que é governar a si mesmo\nControle, rigidez e autogoverno\nSer, ter e fazer\nA ordem dos afetos","abertura":"Governo é o princípio que dá unidade, direção e ordem a uma vida. Quando ele está fora de você, a vida toma a forma do que está fora: o medo, a culpa, a urgência dos outros.","lojas":[]}$t$::jsonb, now())
on conflict (collection, slug) do update set title = excluded.title, subtitle = excluded.subtitle, excerpt = excluded.excerpt, body = excluded.body, cover_url = excluded.cover_url, sort_order = excluded.sort_order, data = excluded.data, updated_at = now();
insert into content_items (collection, slug, title, subtitle, excerpt, body, cover_url, status, featured, sort_order, data, published_at)
values ($t$livro$t$, $t$ninguem-vai-fazer-por-voce$t$, $t$Ninguém Vai Fazer Por Você$t$, $t$Assuma o Controle da Sua Vida Agora$t$, $t$O livro da retomada: como sair da reação, parar de terceirizar a própria vida e retomar o comando da agenda, do dinheiro e das decisões. Lançamento em 2026.$t$, $t$Em algum momento, sem assinar nada, você passou o comando da sua vida para outra pessoa: o chefe, a urgência, o medo, a opinião dos outros. Você não perdeu o controle. Você entregou, sem perceber.

Autogoverno é a capacidade de responder por si: decidir, agir e corrigir sem esperar que alguém faça por você. Neste livro de entrada, Daniel Basso mostra, de forma direta e prática, como retomar o comando da agenda, do dinheiro e das decisões, uma área de cada vez. E por que esperar é o caminho mais caro.

## O que você vai encontrar

- O momento exato em que entregamos o comando
- Por que o problema não é tempo, é prioridade
- Como retomar uma área de cada vez
- Como transformar culpa em responsabilidade$t$, $t$/livros/capa-ninguem-vai-fazer-por-voce.webp$t$, 'published', true, 2, $t${"situacao":"em-breve","cor":"terracota","ano":"2026","editora":"Edições Attos","paginas":null,"isbn":"","etapa":"ordem","trecho":"Você não perdeu o controle da sua vida. Você entregou, sem perceber.","sumario":"O momento em que entregamos o comando\nO problema não é tempo, é prioridade\nUma área de cada vez\nDa culpa à responsabilidade","abertura":"Em algum momento, sem assinar nada, você passou o comando da sua vida para outra pessoa: o chefe, a urgência, o medo, a opinião dos outros.","lojas":[]}$t$::jsonb, now())
on conflict (collection, slug) do update set title = excluded.title, subtitle = excluded.subtitle, excerpt = excluded.excerpt, body = excluded.body, cover_url = excluded.cover_url, sort_order = excluded.sort_order, data = excluded.data, updated_at = now();
insert into content_items (collection, slug, title, subtitle, excerpt, body, cover_url, status, featured, sort_order, data, published_at)
values ($t$livro$t$, $t$nada-pode-me-deter$t$, $t$Nada Pode Me Deter$t$, $t$Como perdi o que eu achava que era e reconstruí minha vida$t$, $t$Uma história real: como Daniel Basso perdeu o cargo, a renda e a própria identidade, e reconstruiu a vida por inteiro.$t$, $t$Filho de família simples, aluno de escola pública em Jundiaí, Daniel Basso começou a empreender cedo e só voltou aos estudos na vida adulta. Construiu escolas, formou professores, liderou instituições. E acreditava que era exatamente isso: o cargo, o papel, o título.

Em setembro de 2024, perdeu posições que levou anos para construir e parte importante da renda da casa. Sem o cargo, descobriu que não sabia mais quem era. Casamento, filhos, amigos, trabalho: tudo esteve por um fio.

Esta é a história de como ele voltou. Não mais ou menos, mas por inteiro. E de como a reconstrução da própria vida deu origem ao Método Autogoverno, que hoje ajuda pessoas, empresas e instituições a retomar o comando.

**O que um homem faz, outro também faz.**

## O que você vai encontrar

- Como crescer sem perder a família, a saúde e a paz
- Disciplina que não depende de empolgação
- Como atravessar crises sem voltar ao ponto de partida
- O que significa ser uma pessoa reconstruída$t$, $t$/livros/capa-nada-pode-me-deter.webp$t$, 'published', false, 3, $t${"situacao":"em-breve","cor":"salvia","ano":"2026","editora":"Edições Attos","paginas":null,"isbn":"","etapa":"excelencia","trecho":"Nada pode deter uma pessoa reconstruída, não porque ela não sofre, mas porque não é mais governada pela dor.","sumario":"Crescer sem perder a família, a saúde e a paz\nDisciplina sem empolgação\nAtravessar crises\nUma pessoa reconstruída","abertura":"Em setembro de 2024, perdeu posições que levou anos para construir e parte importante da renda da casa. Sem o cargo, descobriu que não sabia mais quem era.","lojas":[]}$t$::jsonb, now())
on conflict (collection, slug) do update set title = excluded.title, subtitle = excluded.subtitle, excerpt = excluded.excerpt, body = excluded.body, cover_url = excluded.cover_url, sort_order = excluded.sort_order, data = excluded.data, updated_at = now();
insert into content_items (collection, slug, title, subtitle, excerpt, body, cover_url, status, featured, sort_order, data, published_at)
values ($t$livro$t$, $t$ruptura$t$, $t$Ruptura$t$, $t$Quebre o personagem. Reconstrua quem você é.$t$, $t$Uma travessia em dez etapas. Não é um livro para quem quer se sentir melhor. É para quem decidiu ser outro.$t$, $t$Há um dia em que a vida deixa de sussurrar e começa a gritar. O que você fingia controlar escapa pelas mãos, o chão desaparece e o personagem que você criou para sobreviver já não consegue sustentar o peso.

Neste livro, Daniel Basso conduz o leitor por uma travessia em dez etapas: aceitar a realidade como ela é, enterrar a persona, reencontrar o próprio lugar, lutar, forjar disciplina, construir uma vida que sustente o novo eu, escolher com quem caminhar, acertar as contas com o passado e vigiar a si mesmo. Não é um livro para quem quer se sentir melhor. É para quem decidiu ser outro.

**O que se quebra também pode ser reconstruído.**$t$, $t$/livros/capa-ruptura.webp$t$, 'published', false, 4, $t${"situacao":"em-breve","cor":"terracota","ano":"2026","editora":"Edições Attos","paginas":null,"isbn":"","etapa":"clareza","trecho":"A máscara que te salvou é a mesma que hoje te aprisiona.","sumario":"","abertura":"","lojas":[]}$t$::jsonb, now())
on conflict (collection, slug) do update set title = excluded.title, subtitle = excluded.subtitle, excerpt = excluded.excerpt, body = excluded.body, cover_url = excluded.cover_url, sort_order = excluded.sort_order, data = excluded.data, updated_at = now();
commit;
