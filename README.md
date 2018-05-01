# PokeApp

PokeApp consiste numa aplicação feita em NodeJS que simula a funcionalidade de uma pokedex. Após cadastro o usuário pode "capturar" pokemons e eles são adicionados a sua pokedex. Além da funcionalidade de captura a aplicação também mostra dados de pokemons escolhidos pelo usuário e também quantos ainda faltam para completar a pokedex. Todos os dados sobre os pokemons são provenientes da PokeApi e são acessados através da [pokedex-promise-v2](https://github.com/PokeAPI/pokedex-promise-v2) que também conta com auto-cache, acesse https://pokeapi.co/!

---
# Setup
Para utilizar esse repositório, após o clone, execute **npm install** para instalar todos os packages necessários. Como banco de dados é utilizado o MongoDB através do serviço MLab, a aplicação está online em um servidor do serviço EC2 da Amazon e um bucket do S3 também da Amazon é usado para guardar as fotos de perfil dos usuários. É também necessário atribuir algumas variáveis de ambiente:
```
export MONGODB_URL=url do bando de dados MongoDB
export SESSION_SECRET=qualquer string
export BUCKET_NAME=nome do bucket do S3 usado
export RECOVER_EMAIL=email para utilizar o reset da senha
export RECOVER_PASS =senha do email utilizado acima
```
Além das variáveis de ambiente, um arquivo config.json é necessário para utilizar os serviços da Amazon, nesse arquivo é onde estão as chaves de acesso da conta para os arquivos. Essas chaves de acesso são secretas e únicas para cada cliente da Amazon.

Comece a usar: [PokeApp](http://ec2-52-55-86-96.compute-1.amazonaws.com)
