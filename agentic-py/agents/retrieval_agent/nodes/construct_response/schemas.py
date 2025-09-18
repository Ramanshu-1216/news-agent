from pydantic import BaseModel, Field
from typing import Literal


class RoutingDecisionOutputType(BaseModel):
    """Structured output for routing decisions"""

    routing_decision: Literal[
        "ask_more_info",
        "general_conversation",
        "conduct_research",
    ] = Field(description="The routing decision for processing the user query")

    routing_reasoning: str = Field(description="The reasoning for the routing decision")
