use reqwest;
use serde::{Deserialize, Serialize};
use url::Url;

use super::store_config::get_config;

static VERCEL_URI: &str = "https://api.vercel.com";
static PROJECTS_URI: &str = "/v9/projects";

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelProjectLinkDeployHook {
    pub created_at: u64,
    pub id: String,
    pub name: String,
    pub r#ref: String,
    pub url: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelProjectLink {
    pub deploy_hooks: Vec<VercelProjectLinkDeployHook>,
}
#[derive(Serialize, Deserialize)]
pub struct VercelProject {
    pub name: String,
    pub link: VercelProjectLink
}

#[derive(Serialize, Deserialize)]
pub struct VercelProjects {
  pub projects: Vec<VercelProject>,
}

#[tauri::command]
pub async fn get_projects(app: tauri::AppHandle) -> VercelProjects {
    let team = get_config(app.clone(), "vercel_team", "").expect("Not found vercel team");
    let token = get_config(app.clone(), "vercel_token", "").expect("Not found vercel token");
    let client = reqwest::Client::new();
    let url = Url::parse(VERCEL_URI).unwrap().join(PROJECTS_URI).unwrap();
    client
    .get(url)
    .bearer_auth(token)
    .query(&[("teamId", team)])
    .send()
    .await
    .expect("Get fail")
    .json::<VercelProjects>()
    .await
    .expect("Parse fail")
}
