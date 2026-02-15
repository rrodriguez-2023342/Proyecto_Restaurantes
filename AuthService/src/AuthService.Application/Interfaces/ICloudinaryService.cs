namespace AuthService.Application.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFileData imageFile, string filename);
    Task<bool> DeleteImageAsync(string publicId);
    string GetDefaultAvantarUrl();
    string GetFullImageUrl(string imagePath);
}
