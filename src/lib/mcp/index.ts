import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getPassport from "./tools/get-passport";
import searchJobs from "./tools/search-jobs";
import listMyApplications from "./tools/list-my-applications";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "talentxcel-mcp",
  title: "TalentXcel MCP",
  version: "0.1.0",
  instructions:
    "TalentXcel Career Passport tools. Use `get_passport` to read the signed-in user's verified career identity (profile, education, experience, certificates). Use `search_jobs` to search TalentXcel job postings. Use `list_my_applications` to review the user's job applications.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getPassport, searchJobs, listMyApplications],
});
