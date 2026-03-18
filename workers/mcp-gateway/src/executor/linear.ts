import type { ToolExecutor } from "./index";

const LINEAR_API = "https://api.linear.app/graphql";

/** Execute a Linear GraphQL query with the user's API key. */
async function linearQuery(
  query: string,
  variables: Record<string, unknown>,
  apiKey: string,
): Promise<unknown> {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await res.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };

  if (!res.ok || body.errors?.length) {
    const msg =
      body.errors?.[0]?.message ?? `Linear API error ${res.status}`;
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Linear auth failed: ${msg}. Please update your API key.`,
      );
    }
    throw new Error(`Linear API error: ${msg}`);
  }

  return body.data;
}

// ── Tool dispatch ───────────────────────────────────────────

type Args = Record<string, unknown>;

const toolHandlers: Record<
  string,
  (a: Args, apiKey: string) => Promise<unknown>
> = {
  list_issues(a, apiKey) {
    const first = (a.first as number) ?? 50;
    const filterParts: string[] = [];
    if (a.team_key) filterParts.push(`team: { key: { eq: "${a.team_key}" } }`);
    if (a.status) filterParts.push(`state: { name: { eq: "${a.status}" } }`);
    if (a.assignee)
      filterParts.push(`assignee: { name: { containsIgnoreCase: "${a.assignee}" } }`);
    const filter =
      filterParts.length > 0 ? `filter: { ${filterParts.join(", ")} }` : "";

    return linearQuery(
      `query ListIssues($first: Int, $after: String) {
        issues(first: $first, after: $after, ${filter}) {
          nodes {
            id identifier title priority priorityLabel
            state { name }
            assignee { name email }
            team { key name }
            createdAt updatedAt
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { first, after: a.after ?? null },
      apiKey,
    );
  },

  get_issue(a, apiKey) {
    return linearQuery(
      `query GetIssue($id: String!) {
        issue(id: $id) {
          id identifier title description priority priorityLabel
          estimate
          state { name }
          assignee { name email }
          team { key name }
          labels { nodes { name } }
          parent { id identifier title }
          children { nodes { id identifier title state { name } } }
          comments { nodes { body user { name } createdAt } }
          createdAt updatedAt completedAt
        }
      }`,
      { id: a.issue_id },
      apiKey,
    );
  },

  create_issue(a, apiKey) {
    const input: Record<string, unknown> = {
      title: a.title,
      teamId: a.team_id,
    };
    if (a.description) input.description = a.description;
    if (a.priority) input.priority = a.priority;
    if (a.assignee_id) input.assigneeId = a.assignee_id;
    if (a.state_id) input.stateId = a.state_id;
    if (a.parent_id) input.parentId = a.parent_id;
    if (a.estimate) input.estimate = a.estimate;
    if (a.label_ids) input.labelIds = a.label_ids;

    return linearQuery(
      `mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id identifier title url
            state { name }
            team { key name }
          }
        }
      }`,
      { input },
      apiKey,
    );
  },

  update_issue(a, apiKey) {
    const input: Record<string, unknown> = {};
    if (a.title) input.title = a.title;
    if (a.description !== undefined) input.description = a.description;
    if (a.priority !== undefined) input.priority = a.priority;
    if (a.assignee_id) input.assigneeId = a.assignee_id;
    if (a.state_id) input.stateId = a.state_id;
    if (a.estimate !== undefined) input.estimate = a.estimate;

    return linearQuery(
      `mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id identifier title
            state { name }
            assignee { name }
          }
        }
      }`,
      { id: a.issue_id, input },
      apiKey,
    );
  },

  list_teams(a, apiKey) {
    return linearQuery(
      `query ListTeams {
        teams {
          nodes {
            id key name description
            states { nodes { id name type } }
            labels { nodes { id name } }
            members { nodes { id name email } }
          }
        }
      }`,
      {},
      apiKey,
    );
  },

  search_issues(a, apiKey) {
    const first = (a.first as number) ?? 20;
    return linearQuery(
      `query SearchIssues($query: String!, $first: Int) {
        searchIssues(query: $query, first: $first) {
          nodes {
            id identifier title priority priorityLabel
            state { name }
            assignee { name }
            team { key name }
            createdAt updatedAt
          }
        }
      }`,
      { query: a.query, first },
      apiKey,
    );
  },

  add_comment(a, apiKey) {
    return linearQuery(
      `mutation AddComment($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id body
            user { name }
            createdAt
          }
        }
      }`,
      { input: { issueId: a.issue_id, body: a.body } },
      apiKey,
    );
  },

  list_projects(a, apiKey) {
    const first = (a.first as number) ?? 50;
    return linearQuery(
      `query ListProjects($first: Int) {
        projects(first: $first) {
          nodes {
            id name description state
            progress
            lead { name email }
            startDate targetDate
            teams { nodes { key name } }
          }
        }
      }`,
      { first },
      apiKey,
    );
  },
};

// ── Executor ────────────────────────────────────────────────

export const linearExecutor: ToolExecutor = {
  async executeTool(name, args, credentials) {
    const apiKey = credentials.apiKey as string | undefined;
    if (!apiKey) {
      throw new Error("Missing Linear API key in credentials");
    }

    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown Linear tool: ${name}`);
    }

    return handler(args, apiKey);
  },
};
