using System.Windows;
using WorkTrace.Agent.Services;

namespace WorkTrace.Agent
{
    public partial class App : Application
    {
        private TrackingEngine? _trackingEngine;

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            _trackingEngine = new TrackingEngine();
            _trackingEngine.Start();
        }

        private void Application_Exit(object sender, ExitEventArgs e)
        {
            _trackingEngine?.Stop();
        }
    }
}

