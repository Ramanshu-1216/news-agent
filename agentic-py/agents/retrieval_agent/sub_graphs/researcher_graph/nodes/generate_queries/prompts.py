from langchain_core.prompts import PromptTemplate


GENERATE_DIVERSE_QUERIES_PROMPT = PromptTemplate(
    input_variables=["user_message", "chat_history", "category"],
    template="""
    Role: Expert News Analyst and Query Generator
    Task: Query Expansion for RAG Retrieval on News Articles
    
    Analyze the user's message and the chat history, and generate 3 diverse queries optimized for retrieving from vector db.
    You are given the user's message, the chat history, and the category.
    You have extensive knowledge of news articles and you are able to generate queries that will retrieve the most relevant news articles.
    
    Hard Constraints:
    - Exactly 3 queries.
    - Each query 5–12 words.
    - No numbering, bullets, quotes, labels, or extra text.
    - No punctuation except spaces.
    - Queries must be complementary, not redundant.
    - Queries must be in the same language as the user's message.
    
    User Message: {user_message}
    Chat History: {chat_history}
    Category: {category}
    
    Return the 3 diverse queries optimized for retrieving from vector db.
    """,
)
