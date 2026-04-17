from langchain_community.document_loaders import PyMuPDFLoader

def load_pdf(file_path: str):
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    
    for doc in documents:
        doc.page_content = doc.page_content.replace('\x00', '').strip()
        # PyMuPDFLoader defines "page" metadata natively (0-indexed).
        if "page" not in doc.metadata:
            doc.metadata["page"] = 0
            
    return documents
