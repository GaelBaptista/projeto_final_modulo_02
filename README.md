🚚 VeloMed - Sistema de Gestão de Movimentações Logísticas
Um sistema completo para cadastro de usuários, gerenciamento de filiais, motoristas, produtos e movimentações logísticas. Desenvolvido com Node.js, o sistema possui autenticação via JWT, controle de acesso por perfis de usuário, e operações seguras com validação de dados sensíveis.


🛠️ Descrição do Projeto
O VeloMed foi desenvolvido para gerenciar a movimentação de produtos entre filiais, com controle de motoristas, status de movimentações e controle de estoque. Cada operação é validada com regras de negócio específicas, garantindo a integridade dos dados e a segurança do sistema.

O sistema é dividido em três perfis de usuário:

ADMIN: Acesso completo ao sistema, incluindo gestão de usuários e status.
BRANCH (Filial): Cadastro e listagem de produtos, além do gerenciamento de movimentações.
DRIVER (Motorista): Aceite e finalização de movimentações logísticas.

✅ Funcionalidades:
Cadastro, login e gerenciamento de usuários com perfis distintos.
Criação e listagem de produtos para as filiais.
Movimentações de produtos entre filiais com controle de estoque.
Atualização de status das movimentações (PENDING, IN_PROGRESS, FINISHED).
Validação de documentos (CPF para motoristas, CNPJ para filiais).
Middleware de autenticação e autorização com JWT.
Hash de senhas com bcrypt.

🚀 Tecnologias Utilizadas:
Node.js com Express.js
PostgreSQL com Sequelize (ORM)
JWT para autenticação
bcrypt para hash de senhas
dotenv para variáveis de ambiente
Joi para validação de dados
uuid para geração de IDs únicos

⚙️ Instalação e Configuração:
Pré-requisitos
Node.js (v18+)
PostgreSQL instalado e configurado

° Passos para rodar o projeto °
Clone o repositório:
git clone https://github.com/seu-usuario/nome-do-projeto.git  
cd nome-do-projeto 

Instale as dependências:
npm install  

Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto com os seguintes campos:

PORT=3000  
DB_HOST=localhost  
DB_USER=seu_usuario  
DB_PASSWORD=sua_senha  
DB_NAME=logiflow_db  
JWT_SECRET=sua_chave_secreta  
JWT_EXPIRES_IN=1d  

Rode as migrações para criar as tabelas:
npx sequelize db:migrate  

Inicie o servidor:
npm start  

📘 Rotas e Endpoints
🛡️ Autenticação
Login (POST /login)
Requisição: { email, password }
Resposta: { token, name, profile }
👥 Usuários
Cadastro de Usuário (POST /users)

Acesso: ADMIN
Requisição: { name, email, password, profile, document, full_address }
Respostas: 201 Created, 400 Bad Request, 409 Conflict
Listar Usuários (GET /users)

Acesso: ADMIN
Filtro opcional por perfil
Buscar Usuário por ID (GET /users/:id)

Acesso: ADMIN ou DRIVER (próprio ID)
Atualizar Usuário (PUT /users/:id)

Acesso: ADMIN ou DRIVER (próprio ID)
Alterar Status do Usuário (PATCH /users/:id/status)

Acesso: ADMIN
📦 Produtos
Cadastro de Produto (POST /products)

Acesso: BRANCH
Requisição: { name, amount, description, url_cover }
Listar Produtos (GET /products)

Acesso: BRANCH
🔀 Movimentações
Cadastrar Movimentação (POST /movements)

Acesso: BRANCH
Listar Movimentações (GET /movements)

Acesso: BRANCH ou DRIVER
Iniciar Movimentação (PATCH /movements/:id/start)

Acesso: DRIVER
Finalizar Movimentação (PATCH /movements/:id/end)

Acesso: DRIVER (quem iniciou)

🛠️ Possíveis Melhorias
Implementar Swagger para documentação automatizada.
Adicionar testes automatizados com Jest.
Melhorar o controle de permissões com bibliotecas como Casl.
Implementar cache para otimizar a listagem de produtos.

🧑‍💻 Autor
Feito com ❤️ por Gabriel.
