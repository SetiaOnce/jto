from fastapi import FastAPI, WebSocket

fastapi_app = FastAPI()

@fastapi_app.get("/api/ping")
async def ping():
    return {"message": "pong from FastAPI"}

@fastapi_app.websocket("/ws/weight")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"weight": 999})
