using System.Text.Json;

namespace AuthService.Api.Middlewares;

public class UnauthorizedResponseMiddleware(RequestDelegate next)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        var originalBody = context.Response.Body;

        using (var memoryStream = new MemoryStream())
        {
            context.Response.Body = memoryStream;
            
            try
            {
                await next(context);
            }
            catch
            {
                context.Response.Body = originalBody;
                throw;
            }

            // Si es 401, 403, 404, 400 Y la respuesta está vacía, agregar mensaje
            if (memoryStream.Length == 0 && IsErrorStatus(context.Response.StatusCode))
            {
                context.Response.ContentType = "application/json";

                var (message, errorCode) = GetErrorResponse(context.Response.StatusCode);

                var response = new
                {
                    success = false,
                    message = message,
                    errorCode = errorCode,
                    statusCode = context.Response.StatusCode,
                    traceId = context.TraceIdentifier,
                    timestamp = DateTime.UtcNow
                };

                var json = JsonSerializer.Serialize(response, JsonOptions);
                var bytes = System.Text.Encoding.UTF8.GetBytes(json);
                
                context.Response.ContentLength = bytes.Length;
                await originalBody.WriteAsync(bytes, 0, bytes.Length);
            }
            else if (memoryStream.Length > 0)
            {
                // Copiar respuesta original si tiene contenido
                memoryStream.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBody);
            }
        }
    }

    private static bool IsErrorStatus(int statusCode)
    {
        return statusCode switch
        {
            400 => true,
            401 => true,
            403 => true,
            404 => true,
            500 => true,
            _ => false
        };
    }

    private static (string message, string errorCode) GetErrorResponse(int statusCode)
    {
        return statusCode switch
        {
            400 => ("Solicitud inválida. Verifique los parámetros y tipos de datos.", "BAD_REQUEST"),
            401 => ("No autenticado. Por favor, proporcione credenciales válidas.", "UNAUTHORIZED"),
            403 => ("Acceso denegado. No tiene permisos para acceder a este recurso.", "FORBIDDEN"),
            404 => ("Recurso no encontrado.", "NOT_FOUND"),
            500 => ("Error interno del servidor. Intente más tarde.", "INTERNAL_SERVER_ERROR"),
            _ => ("Error desconocido.", "UNKNOWN_ERROR")
        };
    }
}

