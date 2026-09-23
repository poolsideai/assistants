use tauri::{App, AppHandle, Emitter, Manager, Runtime, Url, WebviewUrl, WebviewWindowBuilder};
__POOL_SYNTHETIC_IMPORT_BASELINE__
const MAIN_WINDOW_LABEL: &str = "main";
const THIRD_PARTY_LICENSES_WINDOW_LABEL: &str = "third-party-licenses";
const THIRD_PARTY_LICENSES_PAGE: &str = "third-party-licenses.html";
const THIRD_PARTY_LICENSES_DEEP_LINK_HOST: &str = "third-party-licenses";
const CHANGELOG_WINDOW_LABEL: &str = "changelog";
const CHANGELOG_PAGE: &str = "changelog.html";
const CHANGELOG_DEEP_LINK_HOST: &str = "changelog";
__POOL_SYNTHETIC_IMPORT_BASELINE__
pub fn create_main_window<R: Runtime>(app: &mut App<R>) -> tauri::Result<()> {
    #[cfg_attr(not(target_os = "macos"), allow(unused_mut))]
    let mut window_config = app
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    // The configured trafficLightPosition is tuned for Tahoe chrome; correct
    // it when the active chrome uses legacy standard-button metrics before the
    // window is built (see window_chrome.rs).
    #[cfg(target_os = "macos")]
    crate::window_chrome::adjust_traffic_light_position(&mut window_config);
    let dev_url = app.config().build.dev_url.clone();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let mut builder = WebviewWindowBuilder::from_config(app.handle(), &window_config)?
        // Wry does not expose frame/gesture information here. Navigation must
        // never launch an external application; trusted document click handlers
        // use the explicit open_external_url command instead.
        .on_navigation(move |url| is_allowed_navigation(url, dev_url.as_ref()))
        .on_new_window(|_, _| tauri::webview::NewWindowResponse::Deny);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        let vibrancy_enabled = crate::settings::read_settings(app.handle())
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    Ok(())
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
#[tauri::command]
pub fn open_third_party_licenses(app_handle: AppHandle) -> Result<(), String> {
    open_third_party_licenses_window(&app_handle).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn open_changelog(app_handle: AppHandle) -> Result<(), String> {
    open_changelog_window(&app_handle).map_err(|err| err.to_string())
}

pub fn is_third_party_licenses_deep_link(url: &Url) -> bool {
    url.scheme() == "poolside"
        && url.host_str() == Some(THIRD_PARTY_LICENSES_DEEP_LINK_HOST)
        && matches!(url.path(), "" | "/")
}

pub fn is_changelog_deep_link(url: &Url) -> bool {
    url.scheme() == "poolside"
        && url.host_str() == Some(CHANGELOG_DEEP_LINK_HOST)
        && matches!(url.path(), "" | "/")
}

/// Routes the Cmd-W ("Close Tab") menu accelerator by key window. The
/// predefined Close Window items are removed from the menu (see settings.rs),
/// so this handler owns Cmd-W for every window: the main window's webview
/// decides between closing a tab and closing the window; any other key window
/// — the changelog and third-party licenses windows, or a native panel like
/// the About panel — gets the `performClose:` the removed menu item would
/// have sent. On macOS the key window comes from AppKit rather than
/// `is_focused`, which can keep reporting the main window as focused while a
/// secondary window is key.
pub fn handle_close_shortcut<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<()> {
    let handle = app_handle.clone();
    app_handle.run_on_main_thread(move || {
        if let Err(err) = route_close_shortcut(&handle) {
            eprintln!("failed to route close shortcut: {err}");
        }
    })
}

#[cfg(target_os = "macos")]
fn route_close_shortcut<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<()> {
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};

    let key_window: *mut AnyObject = unsafe {
        let app: *mut AnyObject = msg_send![class!(NSApplication), sharedApplication];
        msg_send![app, keyWindow]
    };
    if key_window.is_null() {
        return Ok(());
    }

    let main_ns_window = app_handle
        .get_webview_window(MAIN_WINDOW_LABEL)
        .and_then(|window| window.ns_window().ok());
    if main_ns_window == Some(key_window.cast()) {
        return app_handle.emit(crate::settings::CLOSE_TAB_EVENT, ());
    }

    // A secondary webview window (whose delegate routes this through the
    // normal close-requested flow) or a native panel such as the About panel.
    unsafe {
        let _: () = msg_send![key_window, performClose: std::ptr::null_mut::<AnyObject>()];
    }
    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn route_close_shortcut<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<()> {
    let focused = app_handle
        .webview_windows()
        .into_values()
        .find(|window| window.is_focused().unwrap_or(false));
    match focused {
        Some(window) if window.label() == MAIN_WINDOW_LABEL => {
            app_handle.emit(crate::settings::CLOSE_TAB_EVENT, ())
        }
        Some(window) => window.close(),
        None => Ok(()),
    }
}

pub fn open_third_party_licenses_window<R: Runtime>(
    app_handle: &AppHandle<R>,
) -> tauri::Result<()> {
    open_secondary_window(
        app_handle,
        THIRD_PARTY_LICENSES_WINDOW_LABEL,
        THIRD_PARTY_LICENSES_PAGE,
        "Third Party Licenses",
        (980.0, 760.0),
    )
}

pub fn open_changelog_window<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<()> {
    open_secondary_window(
        app_handle,
        CHANGELOG_WINDOW_LABEL,
        CHANGELOG_PAGE,
        "Changelog",
        (720.0, 680.0),
    )
}

/// Single-instance document window (licenses, changelog): reuses and focuses
/// an existing window with the label, keeps navigation inside the app, and
/// opens external links in the default browser like the main window does.
fn open_secondary_window<R: Runtime>(
    app_handle: &AppHandle<R>,
    label: &str,
    page: &str,
    title: &str,
    (width, height): (f64, f64),
) -> tauri::Result<()> {
    if focus_existing_window(app_handle, label)? {
        return Ok(());
    }

    let dev_url = app_handle.config().build.dev_url.clone();
    WebviewWindowBuilder::new(app_handle, label, WebviewUrl::App(page.into()))
        .title(title)
        .inner_size(width, height)
        .min_inner_size(600.0, 400.0)
        .center()
        .on_navigation(move |url| is_allowed_navigation(url, dev_url.as_ref()))
        .on_new_window(|_, _| tauri::webview::NewWindowResponse::Deny)
        .build()?;

    Ok(())
}

fn focus_existing_window<R: Runtime>(
    app_handle: &AppHandle<R>,
    label: &str,
) -> tauri::Result<bool> {
    let Some(window) = app_handle.get_webview_window(label) else {
        return Ok(false);
    };

    window.unminimize()?;
    window.show()?;
    window.set_focus()?;
    Ok(true)
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/// Adds or removes the vibrancy material on the (always transparent) main
/// window, so the "Translucent window" setting applies without a restart.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) else {
        return;
    };
    if let Err(err) = window.set_effects(enabled.then(vibrancy_effects_config)) {
        eprintln!("failed to update window vibrancy: {err}");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
fn is_allowed_navigation(url: &Url, dev_url: Option<&Url>) -> bool {
    // Tauri exempts its own isolation-frame URL before calling this handler.
    // about:blank/srcdoc are needed for opaque sandboxed visualization frames.
    is_app_url(url, dev_url)
        || (url.scheme() == "about" && matches!(url.path(), "blank" | "srcdoc"))
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    (url.scheme() == "tauri" && url.host_str() == Some("localhost") && url.port().is_none())
        || (matches!(url.scheme(), "http" | "https")
            && url.host_str() == Some("tauri.localhost")
            && url.port().is_none())
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    fn denies_external_and_unsupported_navigation() {
        for target in [
            "https://poolside.ai/docs",
            "http://example.com",
            "mailto:hello@poolside.ai",
            "poolside://auth/callback",
            "file:///etc/passwd",
            "file://tauri.localhost/etc/passwd",
            "tauri://other-host/index.html",
            "tauri://localhost:3000/index.html",
            "http://tauri.localhost:3000/index.html",
            "data:text/html,hello",
            "javascript:alert(1)",
            "about:config",
        ] {
            assert!(
                !is_allowed_navigation(&Url::parse(target).unwrap(), None),
                "{target}"
            );
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    fn allows_app_and_sandbox_document_navigation() {
        for target in [
            "tauri://localhost/index.html",
            "https://tauri.localhost/settings",
            "http://tauri.localhost/settings",
            "about:blank",
            "about:srcdoc",
        ] {
            assert!(
                is_allowed_navigation(&Url::parse(target).unwrap(), None),
                "{target}"
            );
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    fn allows_only_the_dev_server_origin() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        assert!(is_allowed_navigation(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        for target in [
            "http://localhost:3000/docs",
            "https://localhost:5177",
            "http://localhost.example.com:5177",
        ] {
            assert!(
                !is_allowed_navigation(&Url::parse(target).unwrap(), Some(&dev_url)),
                "{target}"
            );
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__

    #[test]
    fn matches_changelog_deep_links() {
        assert!(is_changelog_deep_link(
            &Url::parse("poolside://changelog").unwrap(),
        ));
        assert!(is_changelog_deep_link(
            &Url::parse("poolside://changelog/").unwrap(),
        ));
        assert!(!is_changelog_deep_link(
            &Url::parse("poolside://third-party-licenses").unwrap(),
        ));
        assert!(!is_changelog_deep_link(
            &Url::parse("poolside://changelog/extra").unwrap(),
        ));
        assert!(!is_changelog_deep_link(
            &Url::parse("https://poolside.ai/changelog").unwrap(),
        ));
    }

    #[test]
    fn matches_third_party_licenses_deep_links() {
        assert!(is_third_party_licenses_deep_link(
            &Url::parse("poolside://third-party-licenses").unwrap(),
        ));
        assert!(is_third_party_licenses_deep_link(
            &Url::parse("poolside://third-party-licenses/").unwrap(),
        ));
        assert!(!is_third_party_licenses_deep_link(
            &Url::parse("poolside://oauth/callback").unwrap(),
        ));
        assert!(!is_third_party_licenses_deep_link(
            &Url::parse("https://poolside.ai/legal/eula").unwrap(),
        ));
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
