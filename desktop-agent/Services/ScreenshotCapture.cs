using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;

namespace WorkTrace.Agent.Services
{
    public class ScreenshotCapture
    {
        public string CaptureScreen()
        {
            // Get screen bounds using SystemParameters (WPF)
            int width = (int)SystemParameters.PrimaryScreenWidth;
            int height = (int)SystemParameters.PrimaryScreenHeight;

            using (Bitmap bmp = new Bitmap(width, height))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.CopyFromScreen(0, 0, 0, 0, new System.Drawing.Size(width, height));
                }

                // Save to a temporary file
                string tempFile = Path.Combine(Path.GetTempPath(), $"worktrace_ss_{System.DateTime.Now.Ticks}.jpg");
                
                // Save as JPEG with good quality
                ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
                System.Drawing.Imaging.Encoder myEncoder = System.Drawing.Imaging.Encoder.Quality;
                EncoderParameters myEncoderParameters = new EncoderParameters(1);
                EncoderParameter myEncoderParameter = new EncoderParameter(myEncoder, 70L); // 70% quality to save space
                myEncoderParameters.Param[0] = myEncoderParameter;

                bmp.Save(tempFile, jpgEncoder, myEncoderParameters);
                
                return tempFile;
            }
        }

        private ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageEncoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }
    }
}
