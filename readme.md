## Aplicação a ser desenvolvida

Aplicação para gerenciar aluguel de motos e entregadores. Quando um entregador estiver registrado e com uma locação ativa poderá também efetuar entregas de pedidos disponíveis na plataforma.

### Casos de uso

-   Eu como usuário admin quero cadastrar uma nova moto.
    -   Os dados obrigatórios da moto são Identificador, Ano, Modelo e Placa
    -   A placa é um dado único e não pode se repetir.
-   Eu como usuário admin quero consultar as motos existentes na plataforma e conseguir filtrar pela placa.
-   Eu como usuário admin quero modificar uma moto alterando apenas sua placa que foi cadastrado indevidamente
-   Eu como usuário admin quero remover uma moto que foi cadastrado incorretamente, desde que não tenha registro de locações.
-   Eu como usuário entregador quero me cadastrar na plataforma para alugar motos.
    -   Os dados do entregador são( identificador, nome, cnpj, data de nascimento, número da CNHh, tipo da CNH, imagemCNH)
    -   Os tipos de cnh válidos são A, B ou ambas A+B.
    -   O cnpj é único e não pode se repetir.
    -   O número da CNH é único e não pode se repetir.
-   Eu como entregador quero enviar a foto de minha cnh para atualizar meu cadastro.
    -   O formato do arquivo deve ser png ou bmp.
    -   A foto não poderá ser armazenada no banco de dados, você pode utilizar um serviço de storage( disco local, amazon s3, minIO ou outros).
-   Eu como entregador quero alugar uma moto por um período.
    -   Os planos disponíveis para locação são:
        -   7 dias com um custo de R$30,00 por dia
        -   15 dias com um custo de R$28,00 por dia
        -   30 dias com um custo de R$22,00 por dia
        -   45 dias com um custo de R$20,00 por dia
        -   50 dias com um custo de R$18,00 por dia
    -   A locação obrigatóriamente tem que ter uma data de inicio e uma data de término e outra data de previsão de término.
    -   O inicio da locação obrigatóriamente é o primeiro dia após a data de criação.
    -   Somente entregadores habilitados na categoria A podem efetuar uma locação
-   Eu como entregador quero informar a data que irei devolver a moto e consultar o valor total da locação.
    -   Quando a data informada for inferior a data prevista do término, será cobrado o valor das diárias e uma multa adicional
        -   Para plano de 7 dias o valor da multa é de 20% sobre o valor das diárias não efetivadas.
        -   Para plano de 15 dias o valor da multa é de 40% sobre o valor das diárias não efetivadas.
    -   Quando a data informada for superior a data prevista do término, será cobrado um valor adicional de R$50,00 por diária adicional.

**Start do Projeto: Guia Rápido**

Para iniciar o projeto e acessar suas funcionalidades, siga os passos abaixo:

### Comandos Principais:

1.  **`make up` ou `docker-compose up -d --build` **: Inicia o projeto.
2.  **`make down` ou `docker-compose down`**: Encerra o projeto.
3.  **`make commands` ou `docker-compose exec app npm run start`**: Executa comandos da aplicação.

---

### Configuração do MinIO (Simulação do AWS S3):

1.  Acesse o MinIO em [http://localhost:9001/login](http://localhost:9001/login) utilizando as credenciais:
    -   **Login**: minioadmin
    -   **Senha**: minioadmin
2.  No menu "Access Keys", crie uma nova chave usando "Create Access Key +"
3.  Copie o Access Key e o Secret Key.
4.  Substitua os valores das chaves no arquivo `docker-compose` nas linhas 42 e 43:
    ```
    AWS_S3_ACCESS_KEY=uTAz0cVlnY0gvrx5mAku
    AWS_S3_SECRET_KEY=4pvGu3ssVdJZD5RSCWMbuRvxJFF8eA1lEAVCERAA
    ```
5.  Execute novamente o comando `make up` ou `docker-compose up -d --build`.

---

### Criação do Usuário Administrador:

-   Utilize o comando `make commands` ou `docker-compose exec app npm run start` para acessar a CLI da aplicação.
-   Navegue até "App commands -> create admin" e preencha as informações solicitadas.

---

### Documentação das Rotas:

#### Rotas de Autenticação:

```bash
curl --location 'http://localhost:3001/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "email@mail.coim",
    "password": "seuPassword"
}'
```

#### Rotas de Admin:

1.  **Listar Entregadores:**

```bash
curl --location 'http://localhost:3001/deliverers?cnpj=39.238.051%2F0001-91&driverLicenseNumber=34148340222&page=1&perPage=10' \
--header 'Authorization: Bearer seu-token-aqui'
```

2.  **Criar Motocicletas:**

```bash
curl --location 'http://localhost:3001/motorcycles' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu-token-aqui' \
--data '{
    "plate": "XYZ1A21",
    "year": 1990,
    "modelName": "Teste"
}'
```

3.  **Atualizar Placa da Moto:**

```bash
curl --location --request PATCH 'http://localhost:3001/motorcycles/XYZ1A21' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu-token-aqui' \
--data '{
    "plate": "XYZ1A21"
}'
```

4.  **Listar Todas as Motos:**

```bash
curl --location 'http://localhost:3001/motorcycles?page=1&perPage=1' \
--header 'Authorization: Bearer seu-token-aqui'
```

5.  **Deletar uma Moto:**

```bash
curl --location --request DELETE 'http://localhost:3001/motorcycles/XYZ1A21' \
--header 'Authorization: Bearer seu-token-aqui'
```

#### Rotas de Acesso Público:

1.  **Criação do Usuário Motociclista:**

```bash
curl --location 'http://localhost:3001/deliverers' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userType": "deliverer",
    "email": "exampl@mail.com",
    "name": "João Silva",
    "cnpj": "39.238.051/0001-91",
    "birthDate": "1985-07-20",
    "driverLicenseNumber": "34148340222",
    "driverLicenseType": "A",
    "password": "password12345678",
    "passwordConfirmation": "password12345678"
}'
```

2.  **Upload de Imagem do Documento:**

```bash
curl --location 'http://localhost:3001/deliverers/attach' \
--header 'Authorization: Bearer seu-token-aqui' \
--form 'file=@"/Users/leandro@yalo.com/Downloads/eu.png"'
```

#### Rotas para Entregadores:

1.  **Listar os Aluguéis:**

```bash
curl --location 'http://localhost:3001/rents' \
--header 'Authorization: Bearer seu-token-aqui'
```

2.  **Fazer o Aluguel:**

```bash
curl --location 'http://localhost:3001/rents' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu-token-aqui' \
--data '{
    "endDate": "2024-05-08"
}'
```

3.  **Obter a Previsão de Custos do Aluguel:**

```bash
curl --location 'http://localhost:3001/rents/expected-return' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu-token-aqui' \
--data '{
    "deliveryDate": "2024-05-14",
    "plate": "XYZ1A21"
}'
```

4.  **Concluir o Aluguel:**

```
curl --location 'http://localhost:3001/rents/finalize-return' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer seu-token-aqui' \
--data '{
    "deliveryDate": "2024-05-14",
    "plate": "XYZ1A21"
}'
```
