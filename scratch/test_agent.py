import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def main():
    config = LocalAgentConfig(
        system_instructions="You are a helpful coding assistant. Tell a joke and think out loud.",
        capabilities=CapabilitiesConfig()
    )
    async with Agent(config) as agent:
        response = await agent.chat("Calculate 12345 * 67890 and tell me a joke.")
        
        print("--- THOUGHTS ---")
        async for thought in response.thoughts:
            print(thought, end="", flush=True)
        print("\n--- CONTENT ---")
        async for token in response:
            print(token, end="", flush=True)
        print()

if __name__ == "__main__":
    asyncio.run(main())
