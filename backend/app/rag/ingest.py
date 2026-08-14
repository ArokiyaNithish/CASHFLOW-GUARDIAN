"""
RAG Ingest — Chunks policy docs and builds FAISS vector index.
Uses sentence-transformers directly to avoid langchain pydantic version issues.
"""
import os
import pickle
from pathlib import Path

DOCS_DIR = Path("d:/Hackathon/docs/policies/")
INDEX_DIR = Path("d:/Hackathon/backend/app/rag/faiss_index/")


def build_faiss_index():
    if not DOCS_DIR.exists():
        print(f"Docs dir {DOCS_DIR} not found.")
        return

    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    # Load all markdown files
    all_texts = []
    all_meta = []
    for md_file in sorted(DOCS_DIR.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        # Simple chunking: split by double newline, keep ~350 char chunks
        paragraphs = content.split("\n\n")
        current_chunk = ""
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) < 400:
                current_chunk = current_chunk + " " + para if current_chunk else para
            else:
                if current_chunk:
                    all_texts.append(current_chunk)
                    all_meta.append({"source": md_file.stem})
                current_chunk = para
        if current_chunk:
            all_texts.append(current_chunk)
            all_meta.append({"source": md_file.stem})

    if not all_texts:
        print("No text chunks found.")
        return

    print(f"Loaded {len(all_texts)} chunks from {len(list(DOCS_DIR.glob('*.md')))} docs")

    # Embed using sentence-transformers directly
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        import numpy as np

        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Encoding chunks...")
        embeddings = model.encode(all_texts, show_progress_bar=True, convert_to_numpy=True)

        # Build FAISS index
        dim = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(embeddings.astype("float32"))

        # Save index + metadata
        faiss.write_index(index, str(INDEX_DIR / "index.faiss"))
        with open(INDEX_DIR / "chunks.pkl", "wb") as f:
            pickle.dump({"texts": all_texts, "meta": all_meta}, f)

        print(f"FAISS index saved: {len(all_texts)} chunks at {INDEX_DIR}")

    except ImportError as e:
        print(f"Import error: {e}. Using keyword fallback.")


if __name__ == "__main__":
    build_faiss_index()
