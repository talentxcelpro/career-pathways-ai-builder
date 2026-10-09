@rem ==========================================================================
@rem TalentXcel Android Gradle Wrapper Execution Script
@rem ==========================================================================
@echo off
setlocal

set GRADLE_BIN=C:\Users\Arshid.Wani\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat

if exist "%GRADLE_BIN%" (
    call "%GRADLE_BIN%" %*
) else (
    gradle %*
)

endlocal
