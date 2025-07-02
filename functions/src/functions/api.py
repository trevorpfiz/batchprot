from fastapi import FastAPI
from mangum import Mangum

from functions.shared import foo

# Create FastAPI app with JSON configuration
app = FastAPI(
    title="SST FastAPI App",
    json_encoder=None,  # Use FastAPI's default JSON encoder
)


# Create a route
@app.get("/")
async def root():
    print("Function invoked from Python")

    # Share code within the same workspace package
    result = foo()
    print(result)

    return {
        "message": "Hello from Python!",
    }


# Create handler for AWS Lambda with specific configuration
handler = Mangum(app, api_gateway_base_path=None, lifespan="off")
