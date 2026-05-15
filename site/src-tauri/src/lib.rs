use tauri::Manager;

#[cfg(target_os = "android")]
const RUNTIME_PLATFORM: &str = "android";
#[cfg(target_os = "ios")]
const RUNTIME_PLATFORM: &str = "ios";
#[cfg(all(not(target_os = "android"), not(target_os = "ios")))]
const RUNTIME_PLATFORM: &str = "desktop";

fn escape_js_string(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
}

fn runtime_marker_script() -> String {
    let mut parts = vec![format!("platform: '{}'", RUNTIME_PLATFORM)];

    if let Some(public_base_url) = option_env!("AN_STUDY_ROOM_PUBLIC_BASE_URL") {
        let trimmed = public_base_url.trim();
        if !trimmed.is_empty() {
            parts.push(format!("apiBaseUrl: '{}'", escape_js_string(trimmed)));
        }
    }

    format!(
        r#"
window.__AN_STUDY_ROOM_DESKTOP__ = Object.assign(
  {{}},
  window.__AN_STUDY_ROOM_DESKTOP__ || {{}},
  {{ {} }}
);
window.dispatchEvent(new CustomEvent('an-runtime-config-updated'));
"#,
        parts.join(", ")
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.eval(runtime_marker_script());
            }
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
