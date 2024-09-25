use tauri::AppHandle;
use tauri_plugin_os::{type_, OsType};
#[derive(Debug, Clone)]
pub struct ShellCmd {
    pub shell: String,
    pub pre: String,
    pub cmd: String,
}

pub fn get_os(cmd: String) -> ShellCmd {
    let zsh = ShellCmd {
        shell: String::from("zsh"),
        pre: String::from("-c"),
        cmd: cmd.clone(),
    };
    let powershell = ShellCmd {
        shell: String::from("pwsh"),
        pre: String::from("/C"),
        cmd: cmd.clone(),
    };
    match type_() {
        OsType::Linux => zsh,
        OsType::Windows => powershell,
        OsType::Macos => zsh,
        OsType::IOS => panic!("Not support IOS"),
        OsType::Android => panic!("Not support Android"),
    }
}
use tauri_plugin_shell::ShellExt;

use super::store_config;

pub struct ShellResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
}
pub fn run_in_workspace(app: tauri::AppHandle, cmd: ShellCmd) -> Result<String, String> {
    let shell = app.shell();
    let binding = store_config::get_config(app.clone(), "workspace", "").unwrap();
    let workspace = binding.trim();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command(cmd.shell)
            .args([cmd.pre, cmd.cmd])
            .current_dir(workspace)
            .output()
            .await
            .unwrap()
    });
    let stdout = String::from_utf8(output.stdout).unwrap();
    let stderr = String::from_utf8(output.stderr).unwrap();
    match output.status.success() {
        true => Ok(stdout),
        false => Err(stderr),
    }
}

#[tauri::command]
pub fn git_status(app: tauri::AppHandle) -> Result<String, String> {
    let cmd = get_os(String::from("git status -sb"));
    run_in_workspace(app, cmd)
}

#[tauri::command]
pub fn git_root(app: tauri::AppHandle) -> Result<String, String> {
    let cmd = get_os(String::from("git rev-parse --show-toplevel"));
    run_in_workspace(app, cmd)
}

#[derive(serde::Serialize)]
#[derive(serde::Deserialize)]
pub enum Dep {
    Zsh,
    Git,
    Pwsh,
}

#[derive(serde::Serialize)]
pub struct CheckDep<'a> {
    pub cmd: &'a str,
    pub dep: Dep,
}
const ZSH: CheckDep = CheckDep {
    cmd: "zsh --version",
    dep: Dep::Zsh,
};
const GIT: CheckDep = CheckDep {
    cmd: "git --version",
    dep: Dep::Git,
};
const PWSH: CheckDep = CheckDep {
    cmd: "Get-Host | Format-Wide -Property Version",
    dep: Dep::Pwsh,
};
#[tauri::command]
pub fn find_deps() -> Result<Vec<CheckDep<'static>>, String> {
    match type_() {
        OsType::Linux => Ok(vec![ZSH, GIT]),
        OsType::Windows => Ok(vec![PWSH, GIT]),
        OsType::Macos => Ok(vec![ZSH, GIT]),
        OsType::IOS => panic!("Not support IOS"),
        OsType::Android => panic!("Not support Android"),
    }
}

#[tauri::command]
pub fn check_dep(app: AppHandle, dep: Dep) -> Result<String, String> {
    let cmd = get_os(String::from(match dep {
        Dep::Git => GIT.cmd,
        Dep::Zsh => ZSH.cmd,
        Dep::Pwsh => PWSH.cmd,
    }));
    run_in_workspace(app, cmd)
}
