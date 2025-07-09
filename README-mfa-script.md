# AWS MFA Credentials Auto-Updater

This script automates the process of updating your AWS MFA session token credentials, eliminating the need to manually copy and paste the values daily.

## Usage

### Basic Usage
```bash
./update-mfa-credentials.sh <6-digit-mfa-code>
```

### Examples
```bash
# Update MFA credentials with token code 123456
./update-mfa-credentials.sh 123456

# The script will:
# 1. Get a session token using your MFA device
# 2. Parse the response
# 3. Update your ~/.aws/credentials file [mfa] profile
# 4. Create a backup of your credentials file
# 5. Verify the update was successful
```

## Optional: Create an Alias

Add this to your `~/.zshrc` file for even easier access:

```bash
# Add this line to your ~/.zshrc
alias update-mfa='/path/to/your/update-mfa-credentials.sh'
```

Then you can simply run:
```bash
update-mfa 123456
```

## Features

- ✅ Validates MFA token format (6 digits)
- ✅ Creates automatic backups of credentials file
- ✅ Colored output for better readability
- ✅ Error handling and validation
- ✅ Verifies successful update
- ✅ Shows token expiration time

## Safety Features

- Creates timestamped backups before making changes
- Uses temporary files for safe updates
- Validates all inputs before processing
- Comprehensive error handling

## Requirements

- AWS CLI installed and configured
- `jq` for JSON parsing (already installed on your system)
- Your MFA device for generating token codes

## What it replaces

Instead of manually:
1. Running `aws sts get-session-token --serial-number YOUR_MFA_SERIAL_ARN --token-code XXXXXX`
2. Copying the AccessKeyId
3. Copying the SecretAccessKey  
4. Copying the SessionToken
5. Manually editing ~/.aws/credentials

You just run:
```bash
./update-mfa-credentials.sh XXXXXX
```

## Configuration

Before running the script, you need to set up your MFA device ARN.

1.  **Create a `.env` file** in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  **Edit the `.env` file** and replace the placeholder with your actual MFA serial ARN:
    ```
    MFA_SERIAL="arn:aws:iam::123456789012:mfa/your-username"
    ```

The script also uses these default values (which can be modified at the top of the script):
- Credentials File: `~/.aws/credentials`
- MFA Profile: `mfa` 
