from langchain_community.document_loaders import UnstructuredPDFLoader

def load_pdf(file_path: str):
    loader = UnstructuredPDFLoader(file_path, mode="elements")
    documents = loader.load()
    
    for doc in documents:
        doc.page_content = doc.page_content.replace('\x00', '').strip()
        if "page_number" in doc.metadata:
            doc.metadata["page"] = doc.metadata["page_number"]
        elif "page" not in doc.metadata:
            doc.metadata["page"] = 1
            
    return documents
