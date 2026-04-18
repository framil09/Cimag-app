# CIMAG - Controle de Veículos

Sistema de controle e registro de deslocamentos de veículos oficiais do **CIMAG** (Consórcio Intermunicipal do Médio Araguaia Goiano).

## Visão Geral

Aplicativo mobile/web para gestão de frotas públicas com:

- **Registro de viagens** com localização GPS automática
- **Foto obrigatória do hodômetro** com leitura OCR
- **Relatórios PDF** de deslocamento para prestação de contas
- **Controle de acesso** por perfil (Gestor / Motorista)

## Arquitetura

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native (Expo SDK 54) + expo-router |
| Backend | NestJS + Prisma ORM |
| Banco de Dados | PostgreSQL (embedded para dev) |
| Storage | AWS S3 |
| OCR | AbacusAI API |
| Autenticação | JWT (bcryptjs) |

## Estrutura

```
cimag_app/
├── nodejs_space/       # Backend NestJS
│   ├── prisma/         # Schema e seed do banco
│   └── src/
│       ├── auth/       # Autenticação JWT + guards de role
│       ├── trips/      # CRUD de viagens
│       ├── reports/    # Geração de relatórios PDF
│       ├── ocr/        # Leitura de hodômetro via OCR
│       ├── geocode/    # Geocodificação reversa
│       ├── upload/     # Upload S3 com presigned URLs
│       └── prisma/     # Serviço Prisma
├── react_native_space/ # Frontend React Native
│   ├── app/            # Telas (expo-router file-based routing)
│   │   ├── (tabs)/     # Tabs: Início, Histórico, Relatórios/CIMAG, Perfil
│   │   ├── auth/       # Login e Cadastro
│   │   └── trips/      # Iniciar, Encerrar, Detalhes, Editar viagem
│   └── src/
│       ├── components/ # Componentes reutilizáveis
│       ├── contexts/   # AuthContext
│       ├── services/   # Serviços de API
│       └── utils/      # Formatadores
└── start.sh            # Script para iniciar tudo
```

## Setup Rápido

### Pré-requisitos

- Node.js 22+
- npm 11+

### Instalação

```bash
# Backend
cd nodejs_space
npm install

# Frontend
cd ../react_native_space
npm install
```

### Variáveis de Ambiente

Crie `nodejs_space/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5433/cimag_db
JWT_SECRET=<sua-chave-secreta>
AWS_ACCESS_KEY_ID=<sua-key>
AWS_SECRET_ACCESS_KEY=<sua-secret>
AWS_REGION=us-east-1
AWS_BUCKET_NAME=<seu-bucket>
ABACUSAI_API_KEY=<sua-key>
```

### Executar

```bash
# Opção 1: Script completo (inicia PostgreSQL, backend e frontend)
./start.sh

# Opção 2: Manual
cd nodejs_space
npx prisma db push
npx prisma db seed
npm run start:dev        # Backend na porta 3000

cd ../react_native_space
npx expo start --web     # Frontend na porta 8081
```

### Usuários de Teste

Execute `npx prisma db seed` para criar os usuários de teste.
As credenciais serão exibidas no terminal.

## Perfis de Acesso

| Funcionalidade | Gestor | Motorista |
|---------------|--------|-----------|
| Iniciar/Encerrar viagens | ✅ | ✅ |
| Histórico de viagens | ✅ | ✅ |
| Gerar relatórios PDF | ✅ | ❌ |
| Página institucional CIMAG | ❌ | ✅ |

## API

Documentação Swagger disponível em: `http://localhost:3000/api-docs`

### Endpoints principais

- `POST /api/auth/login` — Login
- `POST /api/signup` — Cadastro
- `GET /api/auth/me` — Perfil do usuário
- `POST /api/trips/start` — Iniciar viagem
- `PATCH /api/trips/:id/end` — Encerrar viagem
- `GET /api/trips` — Listar viagens
- `POST /api/reports/generate` — Gerar relatório *(gestor)*
- `GET /api/reports` — Listar relatórios *(gestor)*

## Licença

Projeto interno do CIMAG — Consórcio Intermunicipal Multifinalitário da Microrregião do Circuito das Águas.