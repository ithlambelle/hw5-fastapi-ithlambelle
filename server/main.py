# =========================================== imports =============================================

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uvicorn
import asyncpg

# ======================================== database setup =========================================

# Database connection details
DATABASE_URL = "postgresql://p_user:p_password@localhost:5432/product_db"

# Establishing a connection to the database
async def connect(): return await asyncpg.connect(DATABASE_URL)

# Context manager to handle the database connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = await connect()
    try: yield
    finally: await app.state.db.close()

# =========================================== app setup ===========================================

# Creating a FastAPI instance
app = FastAPI(lifespan=lifespan)

# Setting up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================ routing  ===========================================

# root route, testing that the connection to the database works
@app.get("/")
async def root():
    try:
        await app.state.db.execute("SELECT 1")
        return {"message": "Hello World! Database connection is successful."}
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="Bye World! Database connection failed.")
    
# get request to get the count of products in the database
@app.get("/products/count")
async def get_products_count():
    try:
        count = await app.state.db.fetchval("SELECT COUNT(*) FROM products")
        return {"count": count}
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="internal server error occurred")

# get request to get all products in the database with pagination
@app.get("/products")
async def get_products(page: int = 1, limit: int = 10):
    try:
        offset = (page - 1) * limit
        products = await app.state.db.fetch(
            "SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2",
            limit,
            offset
        )
        return [dict(product) for product in products]
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="internal server error occurred")

# get request to get a product by its id
@app.get("/products/{product_id}")
async def get_product_by_id(product_id: int):
    try:
        product = await app.state.db.fetchrow(
            "SELECT * FROM products WHERE id = $1",
            product_id
        )
        if product is None:
            raise HTTPException(status_code=404, detail="product not found")
        return dict(product)
    except HTTPException:
        raise
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="internal server error occurred")

# bonus: search products by keyword
@app.get("/products/search/{keyword}")
async def search_products(keyword: str):
    try:
        products = await app.state.db.fetch(
            "SELECT * FROM products WHERE name ILIKE $1",
            f"%{keyword}%"
        )
        return [dict(product) for product in products]
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="internal server error occurred")

# bonus: create a new product
class ProductCreate(BaseModel):
    name: str
    description: str

@app.post("/products")
async def create_product(product: ProductCreate):
    try:
        result = await app.state.db.fetchrow(
            "INSERT INTO products (name, description) VALUES ($1, $2) RETURNING *",
            product.name,
            product.description
        )
        return dict(result)
    except Exception as error:
        print(error)
        raise HTTPException(status_code=500, detail="internal server error occurred")

# ======================================== run the app =========================================
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

# ==============================================================================================