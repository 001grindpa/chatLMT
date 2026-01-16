import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from IPython.display import Image, display
from typing import TypedDict
from typing_extensions import Annotated
# from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
import aiosqlite
import asyncio
from langchain_core.messages import SystemMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from pathlib import Path

db_path = Path("/home/grindpa/code/repos/chatLMT/chat_history.db")

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
# coingecko_key = os.getenv("COINGECKO_API_KEY")


# let's build a client
async def mcp_tools():
    client = MultiServerMCPClient(
        {
            "local": {
                "command": "python",
                "args": ["mcpLocal.py"],
                "transport": "stdio"
            },
            "foreign": {
                "url": "http://127.0.0.1:8000/mcp",
                "transport": "streamable_http"
            }
        }
    )
    tools = await client.get_tools()
    return tools

tools = asyncio.run(mcp_tools())

class State(TypedDict):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)
tavily = TavilySearch(max_results=2)
all_tools = tools + [tavily]

llm = ChatGroq(model="openai/gpt-oss-120b").bind_tools(all_tools)

# memory = MemorySaver()

def bot(state: State):
    state["messages"] = [
        SystemMessage(
            content="""
            Your name is ChatLMT a community focused assistant, 
            the name of the community is LMT DAO, LMT stands for Like Minded Troop,
            it is a community that follows every legitimate web3 (blockchain) activity, 
            be it airdrops, news, trading, etc.\n
            Facts about LMT DAO
            - The founder of LMT DAO is Anyanwu Francis aka Grindpa who is also the dev behind you, his twitter/x is https://x.com/0xgrindpa.
            - LMT DAO has an active WhatsApp community here -> https://chat.whatsapp.com/GXcz2dR0A9TACfJcerFI7S, and a twitter account here https://x.com/lmt_dao.
            - Web3 opportunities (airdrops, trade calls) are mostly posted on the WhatsApp regularly.
            - The official twitter is mostly used for hosting live spaces with community members etc.
            \n
            Important instructions:
            1. Do not say anything about yourself unless user asks
            2. Be amicable and polite at all times, use humour when neccessary too.
            3. After a while of chating, ask a client if they're a member of LMT (if client already said yes before, no need to keep asking).
            4. Be brief with every response unless user wants you to expanciate or elaborate etc.
            5. Respond in html.
            6. Once in a while try to shift conversations to crypto related topics when it starts going off.
            """
        ),
        *state["messages"]
    ]
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph_builder.add_node("bot_node", bot)
graph_builder.add_node("tools", ToolNode(all_tools))

graph_builder.add_edge(START, "bot_node")
graph_builder.add_conditional_edges(
    "bot_node",
    tools_condition
)
graph_builder.add_edge("tools", "bot_node")

# display(Image(graph.get_graph().draw_mermaid_png()))

async def main(q: str, username: str):
    # compile to graph inside main()
    async with aiosqlite.connect("chat_history.db") as conn:
        memory = AsyncSqliteSaver(conn)

        graph = graph_builder.compile(checkpointer=memory)

        config = {"configurable": {"thread_id": username}}
        r = await graph.ainvoke({"messages": [{"role": "user", "content": q}]}, config=config)
        return r["messages"][-1].content

# print(asyncio.run(main("bitcoin price", "grindpa")))
# print(f"using db: {db_path}")