import asyncio
import websockets
import jwt
import json
import sys
import ssl
import time

# --- CRITICAL CONFIGURATION ---
# 1. Replace with your DigitalOcean IP (from 'curl ifconfig.me')
# 2. Use 'ws://' because raw IPs usually don't have SSL
SERVER_IP = "YOUR_SERVER_IP_HERE" 
SERVER_URL = f"ws://142.93.223.67:8000/connection/websocket"

SECRET = "ijKhdtFxrrBiDeFY295DF6EAKe_DbM1jcHoz7ydHxmRjwm8sYZXvWAttbuSQTGVtNUkbiYV1WK58x-6FA7RBog"
MAX_CONNECTIONS = 2000
RAMP_RATE = 50  # We can go fast now!

# --- STATS ---
stats = {"connected": 0, "errors": 0, "closed": 0, "peak": 0, "start": 0}

def generate_token(user_id):
    return jwt.encode({"sub": user_id}, SECRET, algorithm="HS256")

async def monitor():
    print("📊 Monitor started...")
    stats["start"] = time.time()
    while True:
        await asyncio.sleep(0.5)
        elapsed = time.time() - stats["start"]
        if stats["connected"] > stats["peak"]: stats["peak"] = stats["connected"]
        sys.stdout.write(f"\r[Time: {elapsed:.0f}s] 🟢 Online: {stats['connected']} | 🔴 Errors: {stats['errors']} | 💀 Closed: {stats['closed']}   ")
        sys.stdout.flush()

async def connect_user(i):
    try:
        # Direct WS connection (No SSL context needed for ws://)
        async with websockets.connect(SERVER_URL) as ws:
            await ws.send(json.dumps({
                "id": i, 
                "connect": {"token": generate_token(f"u_{i}")}
            }))
            
            response = await ws.recv()
            if "error" in response: raise Exception(f"Refused: {response}")
            
            stats["connected"] += 1
            while True: await ws.recv() # Keep alive
    except Exception as e:
        stats["errors"] += 1
        # Uncomment to debug: print(e)
    finally:
        if stats["connected"] > 0: stats["connected"] -= 1
        stats["closed"] += 1

async def main():
    if "YOUR_SERVER_IP" in SERVER_URL:
        print("❌ ERROR: You forgot to put your IP in the script!")
        return

    print(f"🔥 ATTACKING DIRECTLY: {SERVER_URL}")
    print(f"🎯 Target: {MAX_CONNECTIONS} Concurrent Users")
    
    asyncio.create_task(monitor())
    
    tasks = []
    # Launch users
    for i in range(MAX_CONNECTIONS):
        tasks.append(asyncio.create_task(connect_user(i)))
        await asyncio.sleep(1 / RAMP_RATE)

    print("\n✅ All users launched. Holding connections for 20 seconds...")
    await asyncio.sleep(20)
    
    print("\n\n🛑 Test Finished.")

if __name__ == "__main__":
    try: asyncio.run(main())
    except KeyboardInterrupt: pass