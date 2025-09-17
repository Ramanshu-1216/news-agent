from dataclasses import dataclass


@dataclass
class EmbeddingConfig:
    chunk_size: int = 500
    chunk_overlap: int = 200
