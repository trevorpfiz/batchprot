#!/bin/bash

# AWS MFA Credentials Updater
# Usage: ./update-mfa-credentials.sh <mfa-token-code>

set -e

# Load environment variables from .env file if it exists
if [ -f "$(dirname "$0")/.env" ]; then
    set -o allexport
    source "$(dirname "$0")/.env"
    set +o allexport
fi

# Configuration
MFA_SERIAL=${MFA_SERIAL:?"MFA_SERIAL is not set. Please set it in your .env file."}
CREDENTIALS_FILE="$HOME/.aws/credentials"
MFA_PROFILE="mfa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if MFA token code is provided
if [ $# -eq 0 ]; then
    print_error "MFA token code is required"
    echo "Usage: $0 <mfa-token-code>"
    echo "Example: $0 123456"
    exit 1
fi

MFA_TOKEN=$1

# Validate MFA token format (should be 6 digits)
if ! [[ $MFA_TOKEN =~ ^[0-9]{6}$ ]]; then
    print_error "MFA token must be 6 digits"
    exit 1
fi

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    print_error "AWS credentials file not found at $CREDENTIALS_FILE"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed or not in PATH"
    exit 1
fi

print_status "Getting session token with MFA code: $MFA_TOKEN"

# Get session token from AWS STS
SESSION_OUTPUT=$(aws sts get-session-token \
    --serial-number "$MFA_SERIAL" \
    --token-code "$MFA_TOKEN" \
    --output json 2>/dev/null)

if [ $? -ne 0 ]; then
    print_error "Failed to get session token. Please check your MFA token code and try again."
    exit 1
fi

# Parse the JSON output to extract credentials
ACCESS_KEY_ID=$(echo "$SESSION_OUTPUT" | jq -r '.Credentials.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$SESSION_OUTPUT" | jq -r '.Credentials.SecretAccessKey')
SESSION_TOKEN=$(echo "$SESSION_OUTPUT" | jq -r '.Credentials.SessionToken')
EXPIRATION=$(echo "$SESSION_OUTPUT" | jq -r '.Credentials.Expiration')

# Validate that we got all the required values
if [ "$ACCESS_KEY_ID" = "null" ] || [ "$SECRET_ACCESS_KEY" = "null" ] || [ "$SESSION_TOKEN" = "null" ]; then
    print_error "Failed to parse session token response"
    exit 1
fi

print_status "Successfully retrieved session token"
print_status "Token expires at: $EXPIRATION"

# Create a backup of the credentials file
cp "$CREDENTIALS_FILE" "${CREDENTIALS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
print_status "Created backup of credentials file"

# Update the credentials file
print_status "Updating MFA profile in credentials file"

# Use a temporary file to safely update the credentials
TEMP_FILE=$(mktemp)

# Process the credentials file
awk -v profile="$MFA_PROFILE" \
    -v access_key="$ACCESS_KEY_ID" \
    -v secret_key="$SECRET_ACCESS_KEY" \
    -v session_token="$SESSION_TOKEN" '
BEGIN { in_profile = 0 }

# Check if we hit the target profile
/^\[.*\]$/ {
    if ($0 == "[" profile "]") {
        in_profile = 1
        print $0
        next
    } else {
        in_profile = 0
    }
}

# If we are in the target profile, update the credentials
in_profile && /^aws_access_key_id/ {
    print "aws_access_key_id = " access_key
    next
}

in_profile && /^aws_secret_access_key/ {
    print "aws_secret_access_key = " secret_key
    next
}

in_profile && /^aws_session_token/ {
    print "aws_session_token = \"" session_token "\""
    next
}

# Print all other lines as-is
{ print }
' "$CREDENTIALS_FILE" > "$TEMP_FILE"

# Replace the original file with the updated one
mv "$TEMP_FILE" "$CREDENTIALS_FILE"

print_status "Successfully updated MFA credentials!"
print_status "Your session token expires at: $EXPIRATION"

# Verify the update by checking if the profile exists and has the new access key
if grep -A 5 "^\[$MFA_PROFILE\]" "$CREDENTIALS_FILE" | grep -q "$ACCESS_KEY_ID"; then
    print_status "Verification successful - MFA profile updated with new credentials"
else
    print_warning "Verification failed - please check your credentials file manually"
fi 
