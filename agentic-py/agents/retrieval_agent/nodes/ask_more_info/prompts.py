from langchain_core.prompts import PromptTemplate

ASK_FOR_MORE_INFO_PROMPT = PromptTemplate(
    input_variables=["user_message", "chat_history", "routing_reasoning"],
    template="""
    Role: Expert News Analyst
    Task: Analyze the user's message and ask for more info if needed.
    
    Your system have decided that the user's message is not clear and needs more info.
    Ask for more info in a way that is natural and engaging.
    
    Routing Reasoning: {routing_reasoning}
    User Message: {user_message}
    Chat History: {chat_history}
    """,
)
