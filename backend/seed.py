"""
Main seed entry point.
Run: python seed.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def main():
    print("=" * 50)
    print("CashFlow Guardian — Database Setup")
    print("=" * 50)
    from data.synthetic.seed_crisis import seed
    await seed()
    print("\n✓ Database ready!")
    print("  Start server: python main.py")
    print("  API docs:     http://localhost:8000/docs")

if __name__ == "__main__":
    asyncio.run(main())
