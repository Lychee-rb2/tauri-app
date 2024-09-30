#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ErrMsg {
    InvokeFail,
    WorkspaceIsNotInSafeDirectory,
}


pub fn err_msg(msg: ErrMsg) -> String {
    match msg {
        ErrMsg::InvokeFail => String::from("InvokeFail"),
        ErrMsg::WorkspaceIsNotInSafeDirectory => String::from("WorkspaceIsNotInSafeDirectory"),
    }
}

