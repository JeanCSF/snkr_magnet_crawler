# Snkr Magnet Crawler
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JeanCSF/snkr_magnet_crawler.git
```

2. Instale as dependências:
```bash
npm install
```

3. Caso queira salvar os dados utilizando MongoDB, Será necessário configurar algumas variáveis de ambiente. Crie um arquivo `.env` com as seguintes variáveis:
```dotenv
DB_USER=Seu_usuário_do_banco_de_dados_MongoDB
DB_PASSWORD=Sua_senha_do_banco_de_dados_MongoDB
```

### Execução

Inicie o servidor:

```bash
npm start
ou
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

A aplicação conta com uma interface onde você pode definir algumas configurações iniciais, são elas:

- Se o navegador será exibido ou não.
- Onde os dados serão armazenados Excel ou MongoDB caso você tenha configurado as variaveis de ambiente.
- Quantidade de navegadores que serão executados simultaneamente.
- A Loja onde a busca será executada.

## Sobre os scripts de raspagem

Os scripts de raspagem são responsáveis por coletar informações sobre sneakers em várias lojas online. Aqui está uma visão geral de como eles funcionam:

### Configuração dos Scripts

- Todos os scripts são controlados pelo controller encontrado em `controllers/scrapingController.js`.
- O objeto `storesObj`, localizado na linha 8, contém os principais seletores CSS de cada loja e os termos que serão usados para pesquisa.

### Estrutura de Arquivos

- Dentro da pasta `src`, você encontrará as pastas das funções, cada uma nomeada de acordo com suas responsabilidades.
- Dentro da pasta `src/utils` voce encontrará as funções auxiliares.

## Contribuindo

Se você deseja contribuir com o projeto, siga estas etapas:

1. Faça um fork do repositório.
2. Crie uma branch para sua nova funcionalidade: `git checkout -b feature/nova-funcionalidade`.
3. Commit suas mudanças: `git commit -m 'Adicionando nova funcionalidade'`.
4. Faça push para a branch: `git push origin feature/nova-funcionalidade`.
5. Envie um pull request.

## Licença
Este projeto está licenciado sob a [Licença MIT](LICENSE).
