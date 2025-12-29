#!/bin/bash

echo "🚀 Installing RuleBook AI Dependencies..."
echo ""

# Install dependencies
pip install -r requirements.txt

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env file with your MongoDB password (replace <db_password>)"
echo "2. Run: uvicorn app.main:app --reload --port 8000"
echo "3. Visit http://localhost:8000/docs for API documentation"
echo "4. After first user signs in, run: python create_first_admin.py"
echo ""
echo "📖 See FIREBASE_AUTH_SETUP.md for detailed setup instructions"
