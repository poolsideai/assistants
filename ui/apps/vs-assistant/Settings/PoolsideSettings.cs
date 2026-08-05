using Microsoft.VisualStudio.Shell;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Poolside.Assistant.Settings
{
    public class PoolsideSettings : UIElementDialogPage, INotifyPropertyChanged
    {
        private static readonly string DEFAULT_DISABLED_ENRICHMENTS = string.Join(",", new string[]
        {
            "branch",
            "dependencies",
            "diagnostics",
            "local_search"
        });

        private string uri = "";
        private bool wrapLines = true;
        private bool showKeybindings = false;
        private string disabledEnrichments = DEFAULT_DISABLED_ENRICHMENTS;
        private bool displayedLocalSearchDisabledInfo = false;
        private bool notifyOnApproval = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        private PoolsideSettingsEditor settingsEditor;

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        [Category("Poolside Settings")]
        [DisplayName("Base URI")]
        [Description("The base URI of the Poolside API")]
        public string Uri
        {
            get { return uri; }
            set {
                if (uri != value)
                {
                    uri = value;
                    OnPropertyChanged(nameof(Uri));
                }
            }
        }

        [Category("Poolside Settings")]
        [DisplayName("Wrap Lines")]
        [Description("Wrap lines in code snippets")]
        public bool WrapLines
        {
            get { return wrapLines; }
            set {
                if (wrapLines != value)
                {
                    wrapLines = value;
                    OnPropertyChanged(nameof(WrapLines));
                }
            }
        }

        [Browsable(false)]
        public bool ShowKeybindings
        {
            get { return showKeybindings; }
            set {
                if (showKeybindings != value)
                {
                    showKeybindings = value;
                    OnPropertyChanged(nameof(ShowKeybindings));
                }
            }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        // Visual Studio's settings mechanism won't serialize a list for us, so we have to have a string property and
        // a convenience front.
        [Browsable(false)]
        public string DisabledEnrichmentsString
        {
            get { return disabledEnrichments; }
            set
            {
                if (disabledEnrichments != value)
                {
                    disabledEnrichments = value;
                    OnPropertyChanged(nameof(DisabledEnrichmentsString));
                }
            }
        }
        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public List<string> DisabledEnrichments
        {
            get { return DisabledEnrichmentsString.Split(',').ToList(); }
            set
            {
                var serializedFrom = string.Join(",", value);
                if (serializedFrom != DisabledEnrichmentsString)
                {
                    DisabledEnrichmentsString = serializedFrom;
                    OnPropertyChanged(nameof(DisabledEnrichments));
                }
            }
        }

        [Browsable(false)]
        public bool DisplayedLocalSearchDisabledInfo
        {
            get { return displayedLocalSearchDisabledInfo; }
            set {
                if (displayedLocalSearchDisabledInfo != value)
                {
                    displayedLocalSearchDisabledInfo = value;
                    OnPropertyChanged(nameof(DisplayedLocalSearchDisabledInfo));
                }
            }
        }

        [Category("Poolside Settings")]
        [DisplayName("Notify On Approval")]
        [Description("Show a system notification when approval is needed and the window is not focused")]
        public bool NotifyOnApproval
        {
            get { return notifyOnApproval; }
            set
            {
                if (notifyOnApproval != value)
                {
                    notifyOnApproval = value;
                    OnPropertyChanged(nameof(NotifyOnApproval));
                }
            }
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
        // Each assignment fires PropertyChanged, so the reset propagates to Unified Settings
        // and the webview exactly like a manual edit; callers persist the legacy
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
        protected override UIElement Child
        {
            get
            {
                if (settingsEditor == null)
                {
                    settingsEditor = new PoolsideSettingsEditor(this);
                }
                return settingsEditor;
            }
        }

        protected override void OnActivate(System.ComponentModel.CancelEventArgs e)
        {
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
            base.OnActivate(e);
        }

        protected override void OnApply(PageApplyEventArgs e)
        {
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
            settingsEditor?.SaveSettings();
            base.OnApply(e);
        }

        protected override void OnClosed(EventArgs e)
        {
            // Make sure UI is re-sync'd with the settings as they actually are (this is called after
            // OnApply in the event the user uses OK to apply settings, so they will already have been
            // updated; in the event they cancel, this restores the original settings).
            settingsEditor?.LoadSettings();
            base.OnClosed(e);
        }

        internal WebViewConfiguration GetWebViewConfiguration()
        {
            return new WebViewConfiguration
            {
                uri = uri,
                wrapLines = wrapLines,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            };
        }
    }
}
