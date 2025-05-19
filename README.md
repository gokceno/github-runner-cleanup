# GitHub Runner Cleanup Utility

A lightweight Node.js utility script that identifies and removes offline GitHub Actions runners from your GitHub organization.

## Purpose

GitHub self-hosted runners can sometimes become disconnected or unresponsive, but still remain registered in your organization. This script automatically identifies offline runners and removes them, keeping your GitHub Actions environment clean and manageable.

## Features

- Lists all runners in your GitHub organization
- Identifies runners with offline status
- Safely removes all offline runners
- Detailed logging of actions and results
- Pagination support for organizations with many runners

## Requirements

- Node.js 18 or higher
- GitHub Personal Access Token (PAT) with `admin:org` permissions

## Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
```

## Configuration

The script uses environment variables for configuration:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_ORG` | Your GitHub organization name | Yes |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `admin:org` permissions | Yes |

⚠️ **Security Notice**: Never commit your token to version control. Always use environment variables for sensitive information.

## Usage

Set the required environment variables and run the script:

```bash
# Set environment variables
export GITHUB_ORG="YourOrgName"
export GITHUB_TOKEN="your-token-here"

# Run the script
npm start
```

Or directly with Node:

```bash
# Set environment variables
export GITHUB_ORG="YourOrgName"
export GITHUB_TOKEN="your-token-here"

# Run the script
node remove.js
```

For Windows Command Prompt:
```cmd
set GITHUB_ORG=YourOrgName
set GITHUB_TOKEN=your-token-here
node remove.js
```

For Windows PowerShell:
```powershell
$env:GITHUB_ORG = "YourOrgName"
$env:GITHUB_TOKEN = "your-token-here"
node remove.js
```

## Expected Output

The script will output information about all runners found and their status, followed by actions taken on offline runners:

```
Fetching runners for organization: YourOrgName...
Fetching all runners...
Fetching page 1...
Total runners found: 5
Runner ID: 1234, Name: runner-1, Status: online
Runner ID: 1235, Name: runner-2, Status: offline
Runner ID: 1236, Name: runner-3, Status: online
Runner ID: 1237, Name: runner-4, Status: offline
Runner ID: 1238, Name: runner-5, Status: online

Found 2 offline runners.
Starting removal of offline runners...
Removing runner runner-2 (ID: 1235)...
✅ Successfully removed runner runner-2
Removing runner runner-4 (ID: 1237)...
✅ Successfully removed runner runner-4
```

## How It Works

1. The script checks for required environment variables
2. It uses the GitHub API to fetch all registered runners for your organization
3. It identifies runners with a status other than "online"
4. It makes DELETE requests to the GitHub API to remove offline runners
5. All actions are logged to the console

## GitHub API Rate Limits

The script includes small delays between API calls to avoid hitting rate limits. For large organizations with many runners, the script uses pagination to fetch runners in batches.

## License

MIT

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.