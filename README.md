# hw5-fastapi

fastapi homework assignment with next.js frontend

## features

- get total count of products
- get product by id with error handling
- get paginated products list
- bonus: search products by keyword
- bonus: create new products
- complete frontend ui with antd components

## setup

### prerequisites
- docker and docker compose
- python 3.x
- pipenv
- node.js and npm

### running the application

1. start the database:
   ```bash
   docker compose up
   ```

2. start the api server:
   ```bash
   cd server
   pipenv install
   pipenv run python main.py
   ```
   the api will run on http://localhost:5000

3. start the frontend (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   the frontend will run on http://localhost:3000

## api endpoints

- `GET /` - health check
- `GET /products/count` - get total product count
- `GET /products/{id}` - get product by id
- `GET /products?page=1&limit=10` - get paginated products
- `GET /products/search/{keyword}` - search products by keyword
- `POST /products` - create new product

## usage

1. open the frontend in your browser
2. search for products by id or keyword
3. create new products using the create form
4. all operations include proper error handling and loading states

