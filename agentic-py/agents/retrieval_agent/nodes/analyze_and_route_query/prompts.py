from langchain_core.prompts import PromptTemplate

ANALYZE_AND_ROUTE_QUERY_PROMPT = PromptTemplate(
    input_variables=["user_message", "chat_history"],
    template="""
    Role: Expert Query Routing Assistant that analyzes a user's message and routes it to the appropriate agent.
    You are given the user's message and the chat history.
    
    Return the routing decision and the reasoning for the decision.
    The reasoning should be a one sentence short explanation of the decision.
    The routing decision should be one of the following:
    - general_conversation: casual chit-chat, greetings
    - ask_more_info: only if the input is meaningless/noise: Random characters, empty/whitespace, isolated function words, or severely corrupted text.
    - conduct_research: (default) if the input is a question or a request for information
    
    **DO NOT send to ask_more_info for:**
    - Understandable questions with minor typos
    - Mentions of recognizable news topics
    
    DO NOT send to general_conversation for example:
    - Most recent assistant message said Do you want to explore more on it, then if user responded "Yeah" or "sure" then understand core intent and forward it accordingly as here it will be conduct_research

    Prefer conduct_research when in doubt and the query appears news related.
    
    The user's message is: {user_message}
    The chat history is: {chat_history}
    """,
)
