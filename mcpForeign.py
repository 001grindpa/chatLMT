from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import httpx
import os

mcp = FastMCP("foreign")
# tools built here make external API calls for data

load_dotenv()
coinGecko_api_key = os.getenv("COINGECKO_API_KEY")
google_search_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
search_engine_id = os.getenv("SEARCH_ENGINE_ID")

@mcp.tool()
async def weather(location):
    """
    This tool gets current weather forcast
    
    Args:
        location: city name
    """
    url = "https://wttr.in"
    params = {"format": "j1"}
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.get(f"{url}/{location}", params=params)
            raw_json = r.json()
        city = raw_json["nearest_area"][0]["areaName"][0]["value"]
        country = raw_json["nearest_area"][0]["country"][0]["value"]
        current_condition = raw_json["current_condition"][0]
        current_weather = {"city": city, "country": country, "temp(celcius)": current_condition["temp_C"], "weather_status": current_condition["weatherDesc"][0]["value"]}
        return current_weather
    except ValueError:
        return "invalid format"
    
@mcp.tool()
async def wikipedia(query):
    """
    A wrapper around Wikipedia API. Useful for answering general knowledge questions about people, places, 
    historical events, companies, facts, current events (up to the model's knowledge cutoff, but Wikipedia is frequently updated), 
    science, culture, or any factual topic. Input should be a search query string of the main topic itself 
    (e.g instead of "Satoshi Nakamoto founder of Bitcoin" do "Satoshi Nakamoto", pass the full main topic context if user's query does not have enough context i.e pass people's full correct name, etc). 
    Returns summaries or excerpts from the most relevant Wikipedia articles (typically top 3-5 results with page content snippets). Use this tool when the question requires 
    up-to-date or verifiable factual information that might not be in your training data, or to reduce hallucinations.
    
    Args:
        query: string argument
    """
    headers = {"User-Agent": "MyWikipediaBot/1.0 (francisanyanwuchu@gmail.com)"}
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": query,
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,     
        "format": "json"
        }
    try:
        async with httpx.AsyncClient(timeout=60.0, headers=headers) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            json_data = r.json()
            page = json_data["query"]["pages"]
            for info in page:
                for data in page[info]:
                    if data == "extract":
                        return page[info][data]
    except httpx.HTTPError as e:
        return {"error": f"HTTP error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

@mcp.tool()
async def duckduckGo(query):
    """
    Description: Fetches instant answers from DuckDuckGo's API (e.g., quick facts, calculations, conversions, definitions, weather, time, etc.). 
    Use for simple factual queries, math, unit conversions, or "what is X" questions where a direct concise answer is expected. Input is the exact search query string. 
    Returns structured instant answer if available, otherwise falls back to "No instant answer".
    
    Args:
        query: string argument
    """
    url = "https://api.duckduckgo.com"
    params = {
        "q": query,
        "format": "json"
        }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.get(url, params=params)
            raw_json = r.json()
            return raw_json["Abstract"]
    
    except httpx.HTTPError as e:
        return {"error": f"HTTP error: {str(e)}"}

@mcp.tool()
async def crypto_price(id):
    """
    Fetches the current price for a cryptocurrency from CoinGecko. 
    IMPORTANT: Input MUST be the CoinGecko token ID (the full lowercase name, not the ticker symbol). 
    For tokens with multiple words in the name, use hyphens to join them (e.g., "bitcoin", "ethereum", "chainlink", "wrapped-bitcoin", "usd-coin"). 
    Do NOT use tickers like BTC, ETH, or LINK.
    
    Args:
        id: string argument
    """
    url = "https://api.coingecko.com/api/v3/simple/price"
    headers = {"accept": "application/json", "x-cg-demo-api-key": coinGecko_api_key}
    params = {
        "ids": id.lower(), # for ids with multi string name (bitcoin cash), use a hyphen (bitcoin-cash).
        "vs_currencies": "usd",
        }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.get(url, headers=headers, params=params)
            raw_json = r.json()
            for token in raw_json:
                for price in raw_json[token]:
                    return f"${raw_json[token][price]}"
    
    except httpx.HTTPError as e:
        return {"error": f"HTTP error: {str(e)}"}

@mcp.tool()
async def google(query):
    """
    a tool that performs web search using google to find direct answers, 
    summaries, or general information about a specific query. use this when you need real-time
    data or a concise explanation of a topic
    
    Args:
        query: string argument
    """
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": google_search_api_key,
        "cx": search_engine_id,
        "q": query,
        "num": 1 #get only the top result
        }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.get(url, params=params)
            data = r.json()
            
            if "items" in data:
                return data["items"][0]["snippet"]
            return "No direct result found"
    
    except httpx.HTTPError as e:
        return {"error": f"HTTP error: {str(e)}"}

if __name__ == "__main__":
    mcp.run(transport="streamable-http")