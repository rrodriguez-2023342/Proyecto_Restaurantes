namespace AuthService.Application.Exceptions;

public static class ErrorCodes
{

    public const string EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXIST";

    public const string USERNAME_ALREADY_EXIST = "USERNAME_ALREADY_EXIST";

    public const string INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

    public const string USER_ACOUNT_DISABLED = "USER_ACOUNT_DISABLED";

    public const string IMAGE_UPLOAD_FAILED = "IMAGE_UPLOAD_FAILED";

    public const string INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT";

    public const string FILE_TOO_LARGE = "FILE_TOO_LARGE";
}
