using System;
using System.IO;
using System.Text.Json;

namespace WorkTrace.Agent.Services
{
    public class AuthService
    {
        public string BaseUrl { get; private set; } = "https://worktraceapi-0yag.onrender.com/api/v1";
        private string? _authToken;

        public AuthService()
        {
            LoadConfig();
        }

        private void LoadConfig()
        {
            try
            {
                string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");
                if (File.Exists(configPath))
                {
                    string json = File.ReadAllText(configPath);
                    using (JsonDocument doc = JsonDocument.Parse(json))
                    {
                        var root = doc.RootElement;
                        if (root.TryGetProperty("ApiBaseUrl", out JsonElement baseUrlElement))
                        {
                            BaseUrl = baseUrlElement.GetString() ?? BaseUrl;
                        }
                        
                        if (root.TryGetProperty("AgentToken", out JsonElement tokenElement))
                        {
                            _authToken = tokenElement.GetString();
                        }
                    }
                }
                else
                {
                    // Create default config file if it doesn't exist
                    var defaultConfig = new
                    {
                        ApiBaseUrl = BaseUrl,
                        AgentToken = "YOUR_TOKEN_HERE"
                    };
                    File.WriteAllText(configPath, JsonSerializer.Serialize(defaultConfig, new JsonSerializerOptions { WriteIndented = true }));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading config: {ex.Message}");
            }
        }

        public string? GetToken() => _authToken;

        public bool IsConfigured()
        {
            return !string.IsNullOrEmpty(_authToken) && _authToken != "YOUR_TOKEN_HERE";
        }
    }
}
