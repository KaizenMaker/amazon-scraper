# Amazon Product Scraper

Aplicação full-stack para extração e exibição de produtos da Amazon

## Estrutura do Projeto

/
├── backend/ # Código do servidor
│ ├── src/
│ │ └── index.ts # Ponto de entrada do backend
│ ├── package.json # Dependências do backend
│ └── tsconfig.json # Configuração TypeScript (opcional)
├── frontend/ # Interface do usuário
│ ├── public/
│ ├── src/
│ │ ├── main.js # Lógica principal do frontend
│ │ ├── style.css # Estilos
│ │ └── index.html # Página inicial
│ ├── package.json # Dependências do frontend
│ └── vite.config.js # Configuração do Vite
└── README.md # Este arquivo


## Pré-requisitos
- Bun (v1.1.8+) - [Instalação](https://bun.sh)
- Node.js (v20+) - [Instalação](https://nodejs.org)
- npm (v9+)

## Configuração e Execução

### Backend (Servidor)
```bash
cd backend

# Instalar dependências
bun install

# Iniciar servidor
bun run src/index.ts

O servidor estará disponível em: http://localhost:3000

cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev

Acesse a interface em: http://localhost:5173

1. Acesse http://localhost:5173 no navegador

2. Insira uma palavra-chave de pesquisa (ex: "iphone")

3. Clique em "Scrape Products"

4. Os resultados serão exibidos em cards

BackEnd\
- bun add express axios jsdom cors

FrontEnd\
- npm install

Considerações Importantes
CORS: O backend usa middleware cors para permitir requisições do frontend

User-Agent: A aplicação usa um User-Agent válido para evitar bloqueios

Tratamento de Erros:

Backend: Valida parâmetros e trata erros de scraping

Frontend: Exibe mensagens amigáveis para o usuário em caso de falhas

Limitações:

Extrai apenas dados da primeira página de resultados

A estrutura do HTML da Amazon pode mudar, exigindo atualizações nos seletores

Solução de Problemas
Erros de conexão: Verifique se ambos servidores (backend/frontend) estão rodando

Resultados vazios: A Amazon pode estar bloqueando requisições - tente alterar o User-Agent

Erros de CORS: Certifique-se que o backend está usando o middleware


### Melhorias importantes nesta versão:

1. **Organização hierárquica**: 
   - Separação clara entre seções
   - Estrutura visual do projeto mais legível

2. **Instruções passo a passo**:
   - Comandos exatos para execução
   - URLs de acesso explícitas

3. **Seção de solução de problemas**:
   - Problemas comuns e soluções rápidas

4. **Limitações documentadas**:
   - Transparência sobre o que o projeto faz/não faz

5. **Remoção de redundâncias**:
   - Informações repetidas foram consolidadas
   - Linguagem mais direta e técnica

### Pontos críticos a verificar na implementação:

1. No backend `index.ts`:
```typescript
// Adicione este cabeçalho User-Agent realista
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
}

No frontend vite.config.js:


// Configure o proxy para evitar problemas de CORS no desenvolvimento
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

Atualize o frontend main.js para usar:



// Use caminho relativo com proxy configurado
const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);

