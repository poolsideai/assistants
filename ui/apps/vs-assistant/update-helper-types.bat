@echo off
setlocal

start "" /B "helper\poolside-helper.exe" openapi
for /f "tokens=2 delims=," %%A in ('tasklist /FI "IMAGENAME eq poolside-helper.exe" /FO CSV ^| findstr /I "poolside-helper.exe"') do set SERVER_PID=%%A
timeout /t 2 /nobreak >nul

dotnet tool install --global NSwag.ConsoleCore
nswag openapi2csclient /input:http://localhost:8080/openapi.yaml /output:HelperLSP/Messages.cs /Namespace:Poolside.Assistant.HelperLSP /GenerateClientInterfaces:false /GenerateClientClasses:false /GenerateDtoTypes:true /GenerateNullableReferenceTypes:false /GenerateOptionalPropertiesAsNullable:true

if defined SERVER_PID (
    taskkill /PID %SERVER_PID% /F
    echo Helper process with PID %SERVER_PID% terminated.
) else (
    echo Helper process PID not found. Manual shutdown may be needed.
)

exit /b
