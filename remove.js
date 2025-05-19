// Check for required environment variables
if (!process.env.GITHUB_ORG || !process.env.GITHUB_TOKEN) {
  console.error("Error: Required environment variables not set!");
  console.error("Please set the following environment variables:");
  console.error("- GITHUB_ORG: Your GitHub organization name");
  console.error("- GITHUB_TOKEN: Your GitHub personal access token with admin:org permissions");
  process.exit(1);
}

// Configuration
const organizationName = process.env.GITHUB_ORG;
const personalAccessToken = process.env.GITHUB_TOKEN;
const apiBaseUrl = "https://api.github.com";
const perPage = 100; // Maximum allowed by GitHub API

// Headers for GitHub API requests
const headers = {
  Authorization: `token ${personalAccessToken}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "GitHub-Runner-Cleanup-Script",
};

async function getAllRunners() {
  let page = 1;
  let allRunners = [];
  let hasMorePages = true;

  console.log("Fetching all runners...");

  while (hasMorePages) {
    const url = `${apiBaseUrl}/orgs/${organizationName}/actions/runners?per_page=${perPage}&page=${page}`;
    console.log(`Fetching page ${page}...`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch runners: ${response.status} ${response.statusText} ${errorData ? JSON.stringify(errorData) : ""}`,
      );
    }

    const data = await response.json();
    const runners = data.runners;

    allRunners = [...allRunners, ...runners];

    // Check if there might be more pages
    // GitHub uses a Link header for pagination
    const linkHeader = response.headers.get("Link");
    hasMorePages = linkHeader && linkHeader.includes('rel="next"');

    page++;

    // Add a small delay to avoid hitting rate limits
    if (hasMorePages) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allRunners;
}

async function listAndRemoveOfflineRunners() {
  try {
    console.log(`Fetching runners for organization: ${organizationName}...`);

    // Get all runners for the organization
    const runners = await getAllRunners();

    console.log(`Total runners found: ${runners.length}`);

    // Display all runners and identify offline ones
    const offlineRunners = [];

    runners.forEach((runner) => {
      const status = runner.status;
      const isOnline = status === "online";
      console.log(
        `Runner ID: ${runner.id}, Name: ${runner.name}, Status: ${status}`,
      );

      if (!isOnline) {
        offlineRunners.push(runner);
      }
    });

    console.log(`\nFound ${offlineRunners.length} offline runners.`);

    // Remove offline runners
    if (offlineRunners.length > 0) {
      console.log("Starting removal of offline runners...");

      for (const runner of offlineRunners) {
        console.log(`Removing runner ${runner.name} (ID: ${runner.id})...`);

        try {
          const deleteResponse = await fetch(
            `${apiBaseUrl}/orgs/${organizationName}/actions/runners/${runner.id}`,
            {
              method: "DELETE",
              headers,
            },
          );

          if (deleteResponse.ok) {
            console.log(`✅ Successfully removed runner ${runner.name}`);
          } else {
            const errorData = await deleteResponse.json().catch(() => null);
            console.error(
              `❌ Failed to remove runner ${runner.name}: ${deleteResponse.status} ${deleteResponse.statusText}`,
            );
            if (errorData) console.error(JSON.stringify(errorData, null, 2));
          }

          // Add a small delay between deletions
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(
            `❌ Failed to remove runner ${runner.name}:`,
            error.message,
          );
        }
      }
    } else {
      console.log("No offline runners to remove.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the function
listAndRemoveOfflineRunners();
