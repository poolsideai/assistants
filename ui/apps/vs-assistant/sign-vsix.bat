@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0sign-vsix.ps1" %*
