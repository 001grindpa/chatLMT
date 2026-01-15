from mcp.server.fastmcp import FastMCP
from cs50 import SQL
db = SQL("sqlite:///lmt.db")

mcp = FastMCP("local")
# tools built here only interact with memory(database) in different ways, no tool calls external APIs

@mcp.tool()
def community_roles():
    """
    This tool retrieves all the community roles/positions
    """
    
    roles_list = []
    roles = db.execute("SELECT * FROM userRoles")
    for data in roles:
        roles_list.append(data["roles"])

    return roles_list
    
if __name__ == "__main__":
    mcp.run(transport="stdio")