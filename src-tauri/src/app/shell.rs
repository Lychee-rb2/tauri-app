use super::store_config;
use tauri::AppHandle;
use tauri_plugin_os::{type_, OsType};
use tauri_plugin_shell::{process::Command, ShellExt};

pub struct ShellCmd {
    pub shell: String,
    pub pre: String,
    pub cmd: String,
}

pub struct ShellResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
}


#[derive(serde::Serialize, serde::Deserialize)]
pub enum Dep {
    ZSH,
    GIT,
    PWSH,
}

#[derive(serde::Serialize)]
pub struct CheckDep<'a> {
    pub cmd: &'a str,
    pub dep: Dep,
}
const ZSH: CheckDep = CheckDep {
    cmd: "zsh --version",
    dep: Dep::ZSH,
};
const GIT: CheckDep = CheckDep {
    cmd: "git --version",
    dep: Dep::GIT,
};
const PWSH: CheckDep = CheckDep {
    cmd: "Get-Host | Format-Wide -Property Version",
    dep: Dep::PWSH,
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
    Sheller::new(app).run(String::from(match dep {
        Dep::GIT => GIT.cmd,
        Dep::ZSH => ZSH.cmd,
        Dep::PWSH => PWSH.cmd,
    }))
}

#[tauri::command]
pub fn git_status(app: tauri::AppHandle) -> Result<String, String> {
    Sheller::new(app).run_in_workspace(String::from("git status -sb"))
}


#[tauri::command]
pub fn git_root(app: tauri::AppHandle, path: String) -> Result<String, String> {
    Sheller::new(app).run_in_path(String::from("git rev-parse --show-toplevel"), path)
}


pub struct Sheller {
    app: tauri::AppHandle,
}


impl Sheller {
    pub fn new(app: tauri::AppHandle) -> Self {
        Self { app }
    }

    fn run_command(command: Command) -> Result<String, String> {
        tauri::async_runtime::block_on(async move {
            match command.output().await {
                Ok(output) => {
                    let stdout = String::from_utf8(output.stdout).unwrap();
                    let stderr = String::from_utf8(output.stderr).unwrap();
                    match output.status.success() {
                        true => Ok(stdout),
                        false => Err(stderr),
                    }
                }
                Err(e) => Err(e.to_string()),
            }
        })
    }

    fn get_workspace(&self) -> String {
        match store_config::get_config(self.app.clone(), "workspace", "") {
            Ok(v) => v.trim().to_string(),
            Err(e) => {
                println!("get_workspace error: {}", e.to_string());
                String::from("")
            }
        }
    }

    fn get_command(&self, cmd_string: String) -> Command {
        let zsh = ShellCmd {
            shell: String::from("zsh"),
            pre: String::from("-c"),
            cmd: cmd_string.clone(),
        };
        let powershell = ShellCmd {
            shell: String::from("pwsh"),
            pre: String::from("/C"),
            cmd: cmd_string.clone(),
        };
        let cmd = match type_() {
            OsType::Linux => zsh,
            OsType::Windows => powershell,
            OsType::Macos => zsh,
            OsType::IOS => panic!("Not support IOS"),
            OsType::Android => panic!("Not support Android"),
        };
        self.app.shell().command(cmd.shell).args([cmd.pre, cmd.cmd])
    }

    pub fn run(self, cmd: String) -> Result<String, String> {
        let command = self.get_command(cmd);
        Sheller::run_command(command)
    }

    pub fn run_in_path(self, cmd: String, path: String) -> Result<String, String> {
        let command = self.get_command(cmd).current_dir(path);
        Sheller::run_command(command)
    }

    pub fn run_in_workspace(self, cmd: String) -> Result<String, String> {
        let path = self.get_workspace();

        if path.is_empty() {
            panic!("Not set workspace")
        } else {
            let command = self.get_command(cmd).current_dir(path);
            Sheller::run_command(command)
        }
    }
}
