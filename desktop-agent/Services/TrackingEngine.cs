using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace WorkTrace.Agent.Services
{
    public class TrackingEngine
    {
        private readonly AuthService _authService;
        private readonly ActivityMonitor _activityMonitor;
        private readonly ScreenshotCapture _screenshotCapture;
        private readonly TelemetrySender _telemetrySender;

        private Timer? _activityTimer;
        private Timer? _screenshotTimer;
        private Timer? _uploadTimer;

        private List<ActivityData> _activityBuffer = new List<ActivityData>();
        private readonly object _bufferLock = new object();

        // Settings (Can be moved to config later)
        private readonly int _activityIntervalMs = 10000; // 10 seconds
        private readonly int _screenshotIntervalMs = 120000; // 2 minutes
        private readonly int _uploadIntervalMs = 300000; // 5 minutes

        private DateTime _lastActivityCheck = DateTime.UtcNow;

        public TrackingEngine()
        {
            _authService = new AuthService();
            _activityMonitor = new ActivityMonitor();
            _screenshotCapture = new ScreenshotCapture();
            _telemetrySender = new TelemetrySender(_authService);
        }

        public void Start()
        {
            if (!_authService.IsConfigured())
            {
                // In headless mode, we can only log to file or console
                File.AppendAllText("agent.log", $"[{DateTime.Now}] Cannot start tracking: Agent Token is not configured in appsettings.json\n");
                return;
            }

            File.AppendAllText("agent.log", $"[{DateTime.Now}] Starting WorkTrace Agent...\n");

            _activityTimer = new Timer(OnActivityTick, null, 0, _activityIntervalMs);
            _screenshotTimer = new Timer(OnScreenshotTick, null, 0, _screenshotIntervalMs);
            _uploadTimer = new Timer(OnUploadTick, null, _uploadIntervalMs, _uploadIntervalMs);
        }

        public void Stop()
        {
            _activityTimer?.Dispose();
            _screenshotTimer?.Dispose();
            _uploadTimer?.Dispose();
            
            // Force flush before exit
            OnUploadTick(null);
            
            File.AppendAllText("agent.log", $"[{DateTime.Now}] WorkTrace Agent stopped.\n");
        }

        private void OnActivityTick(object? state)
        {
            var now = DateTime.UtcNow;
            var windowTitle = _activityMonitor.GetActiveWindowTitle();
            var appName = _activityMonitor.GetActiveApplicationName();
            var isIdle = _activityMonitor.IsUserIdle(60000); // 1 min idle threshold

            var activity = new ActivityData
            {
                start_time = _lastActivityCheck.ToString("O"),
                end_time = now.ToString("O"),
                window_title = windowTitle,
                application_name = appName,
                is_idle = isIdle,
                keyboard_strokes = 0, // Not implemented in V1 due to AV risks
                mouse_clicks = 0      // Not implemented in V1 due to AV risks
            };

            lock (_bufferLock)
            {
                _activityBuffer.Add(activity);
            }

            _lastActivityCheck = now;
        }

        private async void OnScreenshotTick(object? state)
        {
            // Don't take screenshots if user is idle for a long time (optional, but saves space)
            if (_activityMonitor.IsUserIdle(300000)) // 5 mins idle
            {
                return;
            }

            try
            {
                string tempFilePath = _screenshotCapture.CaptureScreen();
                var capturedAt = DateTime.UtcNow;

                // Fire and forget upload (or await if you want sequential)
                bool success = await _telemetrySender.SendScreenshotAsync(tempFilePath, capturedAt);
                
                if (success && File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath); // Cleanup
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("agent.log", $"[{DateTime.Now}] Screenshot Error: {ex.Message}\n");
            }
        }

        private async void OnUploadTick(object? state)
        {
            List<ActivityData> toUpload;

            lock (_bufferLock)
            {
                if (_activityBuffer.Count == 0) return;
                toUpload = new List<ActivityData>(_activityBuffer);
                _activityBuffer.Clear();
            }

            bool success = await _telemetrySender.SendActivitiesAsync(toUpload);

            if (!success)
            {
                // If failed, put them back into the buffer
                lock (_bufferLock)
                {
                    _activityBuffer.InsertRange(0, toUpload);
                }
                File.AppendAllText("agent.log", $"[{DateTime.Now}] Failed to upload {_activityBuffer.Count} activities. Re-queued.\n");
            }
        }
    }
}
