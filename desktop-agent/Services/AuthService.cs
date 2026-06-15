using System;
using System.IO;
using System.Text.Json;

namespace WorkTrace.Agent.Services
{
    public class AuthService
    {
        public string BaseUrl { get; private set; } = "https://worktraceapi-0yag.onrender.com/api/v1";
        private string? _enrollmentToken;
        private string? _deviceToken;
        private string _configPath;

        public AuthService()
        {
            _configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");
            LoadConfig();
        }

        private void LoadConfig()
        {
            try
            {
                if (File.Exists(_configPath))
                {
                    string json = File.ReadAllText(_configPath);
                    using (JsonDocument doc = JsonDocument.Parse(json))
                    {
                        var root = doc.RootElement;
                        if (root.TryGetProperty("ApiBaseUrl", out JsonElement baseUrlElement))
                        {
                            BaseUrl = baseUrlElement.GetString() ?? BaseUrl;
                        }
                        
                        if (root.TryGetProperty("AgentToken", out JsonElement tokenElement))
                        {
                            _enrollmentToken = tokenElement.GetString();
                        }

                        if (root.TryGetProperty("DeviceToken", out JsonElement deviceTokenElement))
                        {
                            _deviceToken = deviceTokenElement.GetString();
                        }
                    }
                }
                else
                {
                    var defaultConfig = new
                    {
                        ApiBaseUrl = BaseUrl,
                        AgentToken = "YOUR_TOKEN_HERE",
                        DeviceToken = ""
                    };
                    File.WriteAllText(_configPath, JsonSerializer.Serialize(defaultConfig, new JsonSerializerOptions { WriteIndented = true }));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading config: {ex.Message}");
            }
        }

        public async Task<bool> EnrollDeviceAsync()
        {
            if (!string.IsNullOrEmpty(_deviceToken)) return true; // Already enrolled
            if (string.IsNullOrEmpty(_enrollmentToken) || _enrollmentToken == "YOUR_TOKEN_HERE") return false;

            try
            {
                using var client = new System.Net.Http.HttpClient();
                var payload = new
                {
                    enrollment_token = _enrollmentToken,
                    mac_address = GetMacAddress(),
                    hostname = Environment.MachineName
                };

                var content = new System.Net.Http.StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{BaseUrl}/agent/enroll", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseString);
                    if (doc.RootElement.TryGetProperty("device_token", out JsonElement tokenElement))
                    {
                        _deviceToken = tokenElement.GetString();
                        SaveDeviceToken(_deviceToken);
                        return true;
                    }
                }
                else
                {
                    File.AppendAllText("agent.log", $"[{DateTime.Now}] Enrollment failed: {response.StatusCode}\n");
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText("agent.log", $"[{DateTime.Now}] Enrollment error: {ex.Message}\n");
            }

            return false;
        }

        private string GetMacAddress()
        {
            try
            {
                var nics = System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces();
                foreach (var adapter in nics)
                {
                    if (adapter.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up)
                    {
                        var mac = adapter.GetPhysicalAddress().ToString();
                        if (!string.IsNullOrEmpty(mac)) return mac;
                    }
                }
            }
            catch {}
            return "UNKNOWN_MAC";
        }

        private void SaveDeviceToken(string? token)
        {
            try
            {
                string json = File.ReadAllText(_configPath);
                var config = JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new Dictionary<string, object>();
                config["DeviceToken"] = token ?? "";
                File.WriteAllText(_configPath, JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true }));
            }
            catch {}
        }

        public string? GetToken() => _deviceToken;

        public bool IsConfigured()
        {
            return (!string.IsNullOrEmpty(_enrollmentToken) && _enrollmentToken != "YOUR_TOKEN_HERE") || !string.IsNullOrEmpty(_deviceToken);
        }
    }
}
