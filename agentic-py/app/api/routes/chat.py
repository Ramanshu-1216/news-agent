from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.chat import ChatRequest, StreamEvent
from agents.retrieval_agent.graph import stream_graph
from agents.retrieval_agent.state import InputState
from agents.embedding_agent.state import Category
from langchain_core.messages import ChatMessage
import json
import logging

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


def convert_chat_messages(chat_history: list) -> list[ChatMessage]:
    langchain_messages = []
    for msg in chat_history:
        langchain_messages.append(ChatMessage(role=msg["role"], content=msg["content"]))
    return langchain_messages


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    try:
        chat_history = convert_chat_messages(request.chat_history)

        input_state = InputState(
            query=request.query,
            chat_history=chat_history,
            category=request.category or Category.OTHER,
        )

        async def generate_events():
            try:
                async for event in stream_graph(input_state):
                    event_json = json.dumps(event, default=str)
                    yield f"data: {event_json}\n\n"

            except Exception as e:
                logger.error(f"Error in stream generation: {str(e)}")
                error_event = {
                    "event": "error",
                    "data": {
                        "error": str(e),
                        "message": "An error occurred during streaming",
                    },
                }
                error_json = json.dumps(error_event, default=str)
                yield f"data: {error_json}\n\n"

        return StreamingResponse(
            generate_events(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
            },
        )

    except Exception as e:
        logger.error(f"Error in stream_chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def query_chat(request: ChatRequest):
    try:
        chat_history = convert_chat_messages(request.chat_history)

        input_state = InputState(
            query=request.query,
            chat_history=chat_history,
            category=request.category or Category.OTHER,
        )

        final_response = None
        citations = []

        async for event in stream_graph(input_state):
            if event["event"] == "response_complete":
                final_response = event["data"]["response"]
            elif event["event"] == "complete":
                citations = event["data"].get("citations", [])
            elif event["event"] == "error":
                raise HTTPException(status_code=500, detail=event["data"]["error"])

        if final_response is None:
            raise HTTPException(status_code=500, detail="No response generated")

        return {"response": final_response, "citations": citations}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in query_chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
