#!/usr/bin/env python3
"""
Script to set the first admin user for RuleBook AI
Run this once to create your first admin user
"""

import os
import sys
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
cred_path = os.path.join(
    os.path.dirname(__file__),
    "app/docg-9a14e-firebase-adminsdk-fbsvc-891e32e2b7.json"
)

if not os.path.exists(cred_path):
    print(f"❌ Error: Firebase credentials file not found at {cred_path}")
    sys.exit(1)

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

print("🔥 Firebase Admin SDK initialized")
print()

# Get email from user
admin_email = input("Enter the email address to set as admin: ").strip()

if not admin_email:
    print("❌ Error: Email address is required")
    sys.exit(1)

try:
    # Get user by email
    user = auth.get_user_by_email(admin_email)
    
    print(f"✓ Found user: {user.display_name or 'No name'} ({user.email})")
    print(f"  UID: {user.uid}")
    print()
    
    # Confirm
    confirm = input(f"Set {admin_email} as admin? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("❌ Cancelled")
        sys.exit(0)
    
    # Set admin claim
    auth.set_custom_user_claims(user.uid, {"admin": True})
    
    print()
    print("=" * 60)
    print("✅ SUCCESS!")
    print("=" * 60)
    print(f"Admin privileges granted to: {admin_email}")
    print(f"UID: {user.uid}")
    print()
    print("The user can now access all admin endpoints!")
    print("They may need to sign out and sign in again for changes to take effect.")
    print()
    
except auth.UserNotFoundError:
    print(f"❌ Error: User with email {admin_email} not found")
    print()
    print("The user must sign in via Google authentication at least once")
    print("before they can be set as admin.")
    print()
    print("Steps:")
    print("1. Have the user sign in via Google in the frontend")
    print("2. Run this script again with their email")
    sys.exit(1)

except Exception as e:
    print(f"❌ Error: {str(e)}")
    sys.exit(1)
