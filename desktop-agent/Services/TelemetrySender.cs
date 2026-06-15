using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace WorkTrace.Agent.Services
{
    public class TelemetrySender
    {
        private readonly HttpClient _httpClient;
        private readonly AuthService _authService;

        public TelemetrySender(AuthService authService)
        {
            _authService = authService;
            _httpClient = new HttpClient();
        }

        private void SetAuthHeader()
        {
            var token = _authService.GetToken();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<bool> SendActivitiesAsync(List<ActivityData> activities)
        {
            SetAuthHeader();

            var payload = new { activities = activities };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync($"{_authService.BaseUrl}/tracker/activity", content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending activities: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendScreenshotAsync(string filePath, DateTime capturedAt)
        {
            SetAuthHeader();

            try
            {
                using (var content = new MultipartFormDataContent())
                {
                    var fileContent = new ByteArrayContent(File.ReadAllBytes(filePath));
                    fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/jpeg");
                    
                    content.Add(fileContent, "image", Path.GetFileName(filePath));
                    content.Add(new StringContent(capturedAt.ToString("O")), "captured_at");

                    var response = await _httpClient.PostAsync($"{_authService.BaseUrl}/tracker/screenshot", content);
                    return response.IsSuccessStatusCode;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending screenshot: {ex.Message}");
                return false;
            }
        }
    }

    public class ActivityData
    {
        public string start_time { get; set; }
        public string end_time { get; set; }
        public string application_name { get; set; }
        public string window_title { get; set; }
        public int keyboard_strokes { get; set; }
        public int mouse_clicks { get; set; }
        public bool is_idle { get; set; }
    }
}
