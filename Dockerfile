# Usar uma imagem base do Node.js
FROM node:20.12.2-alpine as builder

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de definição de dependências
COPY package*.json ./

# Instalar todas as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Executar o comando para construir o aplicativo
RUN npm run build

# Iniciar uma nova fase com uma nova imagem base para manter o container final leve
FROM node:20.12.2-alpine

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar apenas as dependências necessárias para a produção do estágio de construção
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copiar os artefatos da build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor a porta que o aplicativo usa
EXPOSE 3000

# Usar uma variável de ambiente para determinar qual script executar
# A variável ENTRY_SCRIPT deve ser definida no momento da execução do container com o caminho completo do script
CMD ["sh", "-c", "node ${ENTRY_SCRIPT}"]
