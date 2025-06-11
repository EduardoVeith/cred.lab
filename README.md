TANC-CRED: Sistema Inteligente de Credenciamento e Check-in de Eventos

O TANC-CRED é uma plataforma web inovadora desenvolvida para automatizar e otimizar o processo de credenciamento e check-in em grandes eventos. Idealizado para resolver problemas comuns de agilidade e processos manuais em eventos, especialmente no contexto de Maceió, Alagoas, o sistema elimina filas e reduz significativamente o tempo de espera. 


Utilizando tecnologias modernas e uma abordagem focada na experiência do usuário, o TANC-CRED garante um fluxo de entrada ágil, seguro e em conformidade com a Lei Geral de Proteção de Dados (LGPD). 




Funcionalidades
O sistema oferece um conjunto robusto de funcionalidades para organizadores e participantes de eventos:

Autenticação Segura: Sistema de login e cadastro com e-mail, senha e validação de CPF, garantindo a integridade e privacidade dos dados. 



Gestão de Eventos: Promotores podem criar e gerenciar eventos, definindo detalhes como data, local e capacidade máxima. 
Emissão e Validação de Credenciais: Geração automática de QR Codes únicos vinculados ao CPF do usuário para cada ingresso, assegurando unicidade e segurança. 

Check-in Rápido: Validação de QR Codes em tempo real por promotores através de um dashboard administrativo, com atualização instantânea via Firebase Realtime Database. 

Interface Intuitiva e Responsiva: Design otimizado para diferentes dispositivos e tamanhos de tela (desktop e mobile). 


Visualização de Ingressos: Participantes podem visualizar seus ingressos adquiridos e acessar suas credenciais. 
Conformidade com a LGPD: Armazenamento mínimo de dados, consentimento explícito e opção de exclusão de conta. 

Tecnologias Utilizadas
Este projeto foi construído com um stack de tecnologias modernas e eficientes:

Frontend:
Next.js: Framework React para renderização híbrida (SSR/CSR) e otimização de performance. 

TypeScript: Linguagem que adiciona tipagem estática ao JavaScript, melhorando a robustez e manutenção do código. 
Figma: Ferramenta para prototipagem e design UI/UX. 

Backend & Banco de Dados:
Node.js: Ambiente de execução para APIs RESTful escaláveis. 
Firebase Functions: Funções serverless para lógica de negócios crítica (validação de CPF, geração de QR Codes). 
Firebase Realtime Database: Banco de dados NoSQL para sincronização de dados em tempo real. 
Versionamento e Colaboração:
GitHub: Para controle de versão, colaboração e documentação técnica. 

Trello: Para gestão de tarefas e sprints semanais (Kanban). 
Discord: Para comunicação diária da equipe. 
Testes e Implantação:
Postman: Para testes de APIs. 



Vercel: Para deploy contínuo da aplicação. 

Arquitetura
O TANC-CRED adota uma arquitetura robusta e escalável:

Frontend: Desenvolvido com Next.js, combina SSR e CSR para performance otimizada, com UI/UX focada na experiência mobile e prototipagem via Figma. 

Backend: Utiliza Node.js para APIs RESTful e Firebase Functions para lógica serverless. 
Banco de Dados: Firebase Realtime Database garante sincronização instantânea de dados entre todos os pontos de acesso. 
Integrações: Geração de QR Codes via Firebase Functions com bibliotecas especializadas; autenticação multicamadas via Firebase Authentication e validação de CPF. 

Configuração e Execução Local
Siga as instruções abaixo para configurar e rodar o projeto TANC-CRED em sua máquina local.

Pré-requisitos

Certifique-se de ter os seguintes softwares instalados:

Node.js (versão LTS recomendada: v18.x ou superior)
npm ou Yarn (gerenciador de pacotes)
Uma conta no Firebase e um projeto configurado (para Realtime Database, Authentication e Functions).
Configuração do Ambiente

 Instale as dependências:

Bash
npm install
# ou
yarn install
Variáveis de Ambiente

Crie um arquivo .env.local na raiz do projeto (se Next.js) ou configure as variáveis de ambiente necessárias para suas Firebase Functions. Você precisará das credenciais do seu projeto Firebase.

Exemplo de .env.local (ajuste conforme a necessidade do seu projeto Firebase):

NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
Para as Firebase Functions, configure seu ambiente Firebase localmente (firebase login, firebase use --add seu-projeto-id).

Como Rodar o Projeto

Inicie o Frontend:

Bash
npm run dev
# ou
yarn dev
 O aplicativo estará disponível em http://localhost:3000.

Inicie o Backend (Firebase Functions - se necessário para testes locais):
As Firebase Functions são serverless e geralmente são implantadas diretamente no Firebase. Para testar localmente, você pode usar o Firebase Emulator Suite.

Bash
firebase emulators:start
 Consulte a documentação do Firebase para mais detalhes sobre como testar e depurar suas funções localmente.

Implantação (Deployment)
O TANC-CRED é implantado através da Vercel para o frontend, garantindo deploy contínuo e alta disponibilidade.  As Firebase Functions são implantadas diretamente no Firebase.


Metodologia de Desenvolvimento
O projeto TANC-CRED foi desenvolvido utilizando a metodologia ágil Scrum, com sprints semanais, reuniões diárias (Daily Scrums) via Discord e gestão de tarefas no Trello (quadro Kanban).  Esta abordagem garantiu um desenvolvimento eficiente, adaptável e focado na entrega contínua de valor. 



Testes
Foram realizados diversos tipos de testes para garantir a estabilidade e qualidade do sistema:

Testes de APIs: Utilizando Postman para validação de status codes, respostas e tratamento de erros. 

Testes de Usabilidade: Conduzidos com testes A/B no Figma e validação com usuários reais para otimização da interface. 

Testes de Compatibilidade: Verificação em diferentes navegadores (Chrome, Firefox, Safari) e dispositivos móveis. 

[cite_start]Simulação de Uso Real: Testes em cenários com múltiplos participantes simultâneos e leitura de QR Codes para avaliar performance e sincronização em tempo real. 


Contribuição
Contribuições são bem-vindas! Se você deseja contribuir para o TANC-CRED, por favor, siga os seguintes passos:

Faça um fork do repositório.
Crie uma nova branch para sua feature (git checkout -b feature/sua-feature).
Faça suas alterações e commit (git commit -m 'feat: Adiciona nova funcionalidade X').
Envie para o branch (git push origin feature/sua-feature).
Abra um Pull Request, descrevendo suas alterações.
